// src/pages/ProfilePage/components/DealerProfile.tsx
// Car Dealer Profile Component - Green Theme

import React from 'react';
import styled from 'styled-components';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import SimpleProfileAvatar from '../../../../../components/Profile/SimpleProfileAvatar';
import { ProfileCar } from '../types';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Building2, Mail, Phone, MapPin, MessageCircle, Star, Clock, CheckCircle, Car } from 'lucide-react';

// Props
interface DealerProfileProps {
  user: BulgarianUser | null;
  userCars: ProfileCar[];
  isOwnProfile: boolean;
  onEdit?: () => void;
  onSendMessage?: () => void;
}

// Styled Components  
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 2.5rem;
  margin-bottom: 2rem;
  align-items: flex-start;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.1);
  
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

const DealerName = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  color: #15803d;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: #16a34a;
  }
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #16a34a;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const DealerDescription = styled.p`
  color: #4b5563;
  line-height: 1.7;
  margin: 1rem 0;
  font-size: 1rem;
`;

const BusinessInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4b5563;
  font-size: 0.95rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #16a34a;
    flex-shrink: 0;
  }
  
  strong {
    color: #1a1a1a;
    font-weight: 600;
    margin-right: 0.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  ${p => p.variant === 'primary' ? `
    background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
    }
  ` : `
    background: white;
    border: 2px solid #16a34a;
    color: #16a34a;
    
    &:hover {
      background: #f0fdf4;
    }
  `}
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #15803d;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    width: 28px;
    height: 28px;
    color: #16a34a;
  }
`;

const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CarCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.2);
    border-color: #16a34a;
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CarInfo = styled.div`
  padding: 1.25rem;
`;

const CarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const CarPrice = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #16a34a;
  margin: 0.5rem 0;
`;

const CarDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
  font-size: 1rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
`;

const StatBox = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-align: center;
  flex: 1;
  
  .value {
    font-size: 1.75rem;
    font-weight: bold;
    color: #16a34a;
    display: block;
  }
  
  .label {
    font-size: 0.85rem;
    color: #6c757d;
    margin-top: 0.25rem;
    display: block;
  }
`;

/**
 * Dealer Profile Component
 * For professional car dealers/showrooms
 * Theme: Green (#16a34a)
 * Features: Business info, inventory, reviews, verified badge
 */
export const DealerProfile: React.FC<DealerProfileProps> = ({
  user,
  userCars,
  isOwnProfile,
  onEdit,
  onSendMessage
}) => {
  const { language } = useLanguage();
  
  if (!user) return null;

  // ✅ STRICT: Show personal name (firstName + lastName)
  const userAny = user as any;
  const personalName = `${userAny.firstName || ''} ${userAny.lastName || ''}`.trim();
  const businessName = personalName || user.displayName || 'Dealer';
  const isVerified = user.verification?.business?.verified || false;
  const trustScore = user.trust?.score || user.verification?.trustScore || 50;
  const totalViews = user.stats?.totalViews || 0;
  const totalInquiries = userCars.reduce((sum, car) => sum + (car.inquiries || 0), 0);

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
          <DealerName>
            <Building2 size={32} />
            {businessName}
            {isVerified && (
              <VerifiedBadge>
                <CheckCircle />
                {language === 'bg' ? 'Проверен дилър' : 'Verified Dealer'}
              </VerifiedBadge>
            )}
          </DealerName>
          
          {user.businessDescription && (
            <DealerDescription>{user.businessDescription}</DealerDescription>
          )}
          
          {/* Business Information */}
          <BusinessInfo>
            {user.bulstat && (
              <InfoItem>
                <Building2 />
                <span><strong>EIK/BULSTAT:</strong> {user.bulstat}</span>
              </InfoItem>
            )}
            
            {user.businessAddress && (
              <InfoItem>
                <MapPin />
                <span>{user.businessAddress}</span>
              </InfoItem>
            )}
            
            {user.businessPhone && (
              <InfoItem>
                <Phone />
                <span>{user.businessPhone}</span>
              </InfoItem>
            )}
            
            {user.businessEmail && (
              <InfoItem>
                <Mail />
                <span>{user.businessEmail}</span>
              </InfoItem>
            )}
            
            {user.workingHours && (
              <InfoItem>
                <Clock />
                <span>{user.workingHours}</span>
              </InfoItem>
            )}
          </BusinessInfo>
          
          {/* Stats Row */}
          <StatsRow>
            <StatBox>
              <span className="value">{userCars.length}</span>
              <span className="label">{language === 'bg' ? 'Обяви' : 'Listings'}</span>
            </StatBox>
            
            <StatBox>
              <span className="value">{totalViews.toLocaleString()}</span>
              <span className="label">{language === 'bg' ? 'Прегледи' : 'Views'}</span>
            </StatBox>
            
            <StatBox>
              <span className="value">{totalInquiries}</span>
              <span className="label">{language === 'bg' ? 'Запитвания' : 'Inquiries'}</span>
            </StatBox>
            
            <StatBox>
              <span className="value">{trustScore}</span>
              <span className="label">{language === 'bg' ? 'Доверие' : 'Trust Score'}</span>
            </StatBox>
          </StatsRow>
          
          {/* Action Buttons */}
          <ActionButtons>
            {isOwnProfile && (
              <Button variant="primary" onClick={onEdit}>
                {language === 'bg' ? 'Редактирай профил' : 'Edit Profile'}
              </Button>
            )}
            
            {!isOwnProfile && (
              <Button variant="primary" onClick={onSendMessage}>
                <MessageCircle />
                {language === 'bg' ? 'Свържи се' : 'Contact Dealer'}
              </Button>
            )}
          </ActionButtons>
        </InfoSection>
      </ProfileHeader>
      
      {/* Inventory Section */}
      <Section>
        <SectionTitle>
          <Car />
          {language === 'bg' ? 'Наличност' : 'Inventory'}
          {' '}({userCars.length} {language === 'bg' ? 'автомобила' : 'vehicles'})
        </SectionTitle>
        
        {userCars.length > 0 ? (
          <CarGrid>
            {userCars.map((car: any) => (
              <CarCard key={car.id}>
                <CarImage 
                  src={car.imageUrl || car.mainImage || '/assets/images/car-placeholder.jpg'} 
                  alt={`${car.make} ${car.model}`}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.errorHandled) {
                      img.dataset.errorHandled = 'true';
                      img.src = '/assets/images/car-placeholder.svg';
                    }
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
                  {car.views && (
                    <CarDetails>
                      <span>{language === 'bg' ? 'Прегледи' : 'Views'}: {car.views}</span>
                      {car.inquiries && (
                        <span>{language === 'bg' ? 'Запитвания' : 'Inquiries'}: {car.inquiries}</span>
                      )}
                    </CarDetails>
                  )}
                </CarInfo>
              </CarCard>
            ))}
          </CarGrid>
        ) : (
          <EmptyMessage>
            {language === 'bg' 
              ? 'Няма налични автомобили в момента'
              : 'No vehicles available at the moment'}
          </EmptyMessage>
        )}
      </Section>
    </Container>
  );
};

export default DealerProfile;


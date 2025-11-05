// src/pages/ProfilePage/components/CompanyProfile.tsx
// Company/Corporate Profile Component - Blue Theme

import React from 'react';
import styled from 'styled-components';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '../../../types/user/bulgarian-user.types';
import SimpleProfileAvatar from '../../../components/Profile/SimpleProfileAvatar';
import { ProfileCar } from '../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Building2, Mail, Phone, MapPin, MessageCircle, Star, Users, BarChart3, Shield } from 'lucide-react';

// Props
interface CompanyProfileProps {
  user: BulgarianUser | null;
  userCars: ProfileCar[];
  isOwnProfile: boolean;
  onEdit?: () => void;
  onSendMessage?: () => void;
}

// Styled Components
const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 3rem;
  margin-bottom: 2rem;
  align-items: flex-start;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(29, 78, 216, 0.1);
  position: relative;
  overflow: hidden;
  
  /* LED Border Effect at 100% completion */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid transparent;
    border-radius: 16px;
    background: linear-gradient(90deg, #1d4ed8, #3b82f6, #1d4ed8) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    /* ⚡ OPTIMIZED: Static subtle glow instead of pulse */
    opacity: 0.4;
    box-shadow: 0 0 15px rgba(29, 78, 216, 0.5);
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 0.7;
  }
  
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

const CompanyName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e40af;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: #1d4ed8;
  }
`;

const EnterpriseBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.3);
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CompanyDescription = styled.p`
  color: #4b5563;
  line-height: 1.8;
  margin: 1rem 0;
  font-size: 1.05rem;
`;

const CorporateInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin: 1.5rem 0;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #1d4ed8;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4b5563;
  font-size: 1rem;
  
  svg {
    width: 22px;
    height: 22px;
    color: #1d4ed8;
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
  gap: 1.25rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border-radius: 6px;  // Sharp edges for corporate look
  font-weight: 600;
  font-size: 1.05rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  ${p => p.variant === 'primary' ? `
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(29, 78, 216, 0.4);
    }
  ` : `
    background: white;
    border: 2px solid #1d4ed8;
    color: #1d4ed8;
    
    &:hover {
      background: #eff6ff;
    }
  `}
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  color: #1e40af;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    width: 32px;
    height: 32px;
    color: #1d4ed8;
  }
`;

const FleetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
    box-shadow: 0 6px 20px rgba(29, 78, 216, 0.2);
    border-color: #1d4ed8;
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
`;

const CarInfo = styled.div`
  padding: 1.5rem;
`;

const CarTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
`;

const CarPrice = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  color: #1d4ed8;
  margin: 0.75rem 0;
`;

const CarDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #6c757d;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  color: #6c757d;
  font-size: 1.05rem;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const StatBox = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 1.25rem 1.75rem;
  border-radius: 12px;
  text-align: center;
  border-left: 4px solid #1d4ed8;
  
  .value {
    font-size: 2rem;
    font-weight: bold;
    color: #1d4ed8;
    display: block;
  }
  
  .label {
    font-size: 0.9rem;
    color: #6c757d;
    margin-top: 0.25rem;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

/**
 * Company Profile Component
 * For corporate/fleet operators
 * Theme: Blue (#1d4ed8)
 * Features: Corporate info, fleet overview, team, analytics
 */
export const CompanyProfile: React.FC<CompanyProfileProps> = ({
  user,
  userCars,
  isOwnProfile,
  onEdit,
  onSendMessage
}) => {
  const { language } = useLanguage();
  
  if (!user) return null;

  const companyName = user.businessName || user.displayName || 'Company';
  const isVerified = user.verification?.business?.verified || false;
  const trustScore = user.trust?.score || user.verification?.trustScore || 50;
  const totalViews = user.stats?.totalViews || 0;
  const totalInquiries = userCars.reduce((sum, car) => sum + (car.inquiries || 0), 0);
  const fleetValue = userCars.reduce((sum, car) => sum + car.price, 0);

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
          <CompanyName>
            <Building2 size={36} />
            {companyName}
            {isVerified && (
              <EnterpriseBadge>
                <Shield />
                {language === 'bg' ? 'Корпоративен партньор' : 'Enterprise Partner'}
              </EnterpriseBadge>
            )}
          </CompanyName>
          
          {user.businessDescription && (
            <CompanyDescription>{user.businessDescription}</CompanyDescription>
          )}
          
          {/* Corporate Information */}
          <CorporateInfo>
            {user.bulstat && (
              <InfoItem>
                <Building2 />
                <span><strong>EIK:</strong> {user.bulstat}</span>
              </InfoItem>
            )}
            
            {user.vatNumber && (
              <InfoItem>
                <Shield />
                <span><strong>VAT:</strong> {user.vatNumber}</span>
              </InfoItem>
            )}
            
            {user.businessAddress && (
              <InfoItem>
                <MapPin />
                <span><strong>HQ:</strong> {user.businessAddress}</span>
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
          </CorporateInfo>
          
          {/* Corporate Stats */}
          <StatsRow>
            <StatBox>
              <span className="value">{userCars.length}</span>
              <span className="label">{language === 'bg' ? 'Автопарк' : 'Fleet Size'}</span>
            </StatBox>
            
            <StatBox>
              <span className="value">€{fleetValue.toLocaleString()}</span>
              <span className="label">{language === 'bg' ? 'Стойност' : 'Fleet Value'}</span>
            </StatBox>
            
            <StatBox>
              <span className="value">{totalViews.toLocaleString()}</span>
              <span className="label">{language === 'bg' ? 'Прегледи' : 'Total Views'}</span>
            </StatBox>
            
            <StatBox>
              <span className="value">{trustScore}</span>
              <span className="label">{language === 'bg' ? 'Рейтинг' : 'Trust Score'}</span>
            </StatBox>
          </StatsRow>
          
          {/* Action Buttons */}
          <ActionButtons>
            {isOwnProfile && (
              <>
                <Button variant="primary" onClick={onEdit}>
                  {language === 'bg' ? 'Управление на профила' : 'Manage Profile'}
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = '/team'}>
                  <Users />
                  {language === 'bg' ? 'Екип' : 'Team Management'}
                </Button>
              </>
            )}
            
            {!isOwnProfile && (
              <Button variant="primary" onClick={onSendMessage}>
                <MessageCircle />
                {language === 'bg' ? 'Свържете се с нас' : 'Contact Us'}
              </Button>
            )}
          </ActionButtons>
        </InfoSection>
      </ProfileHeader>
      
      {/* Fleet Overview */}
      <Section>
        <SectionTitle>
          <BarChart3 />
          {language === 'bg' ? 'Преглед на автопарка' : 'Fleet Overview'}
        </SectionTitle>
        
        {userCars.length > 0 ? (
          <FleetGrid>
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
                  {(car.views || car.inquiries) && (
                    <CarDetails>
                      {car.views && <span>{language === 'bg' ? 'Прегледи' : 'Views'}: {car.views}</span>}
                      {car.inquiries && <span>{language === 'bg' ? 'Запитвания' : 'Inquiries'}: {car.inquiries}</span>}
                    </CarDetails>
                  )}
                </CarInfo>
              </CarCard>
            ))}
          </FleetGrid>
        ) : (
          <EmptyMessage>
            {language === 'bg' 
              ? 'Няма налични автомобили в автопарка'
              : 'No vehicles in the fleet at the moment'}
          </EmptyMessage>
        )}
      </Section>
    </Container>
  );
};

export default CompanyProfile;


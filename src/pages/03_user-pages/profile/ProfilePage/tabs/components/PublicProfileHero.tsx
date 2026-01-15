/**
 * PublicProfileHero Component
 * Hero Section مبسط للبروفايل العام
 * متوافق مع الدستور: لا emojis، استخدام أيقونات Lucide-React
 */

import React from 'react';
import styled from 'styled-components';
import { MapPin, Phone, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface PublicProfileHeroProps {
  user: BulgarianUser;
}

// Theme colors based on profile type
const getThemeColor = (type: string) => {
  switch(type) {
    case 'company': return '#1E3A8A';
    case 'dealer': return '#059669';
    case 'private': return '#EA580C';
    default: return '#64748B';
  }
};

const getThemeGradient = (type: string) => {
  switch(type) {
    case 'company': return 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)';
    case 'dealer': return 'linear-gradient(135deg, #059669 0%, #10B981 100%)';
    case 'private': return 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)';
    default: return 'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)';
  }
};

export const PublicProfileHero: React.FC<PublicProfileHeroProps> = ({ user }) => {
  const { language } = useLanguage();

  const profileType = user.profileType || 'private';
  const isDealer = profileType === 'dealer';
  const isCompany = profileType === 'company';

  const businessName = isDealer 
    ? user.dealerSnapshot?.name 
    : isCompany 
      ? user.companySnapshot?.name 
      : user.displayName;
  
  const businessAddress = isDealer 
    ? user.dealerSnapshot?.address 
    : isCompany 
      ? user.companySnapshot?.address 
      : user.locationData?.cityName;

  const coverImage = user.coverImage || (
    isCompany 
      ? 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1920&h=400&fit=crop' 
      : isDealer 
        ? 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&h=400&fit=crop'
        : 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&h=400&fit=crop'
  );

  return (
    <HeroHeader $coverImage={coverImage} $profileType={profileType}>
      <HeroOverlay $profileType={profileType} />
      <HeroContent>
        <ProfileSection>
          <LogoWrapper $profileType={profileType}>
            <ProfileAvatar 
              src={user.photoURL || '/default-avatar.png'} 
              alt={businessName || 'Profile'}
            />
            {user.verification?.id && (
              <VerifiedBadge>
                <CheckCircle size={20} fill="white" color="#10B981" />
              </VerifiedBadge>
            )}
          </LogoWrapper>

          <InfoColumn>
            <BusinessName $profileType={profileType}>
              {businessName || 'Anonymous Seller'}
            </BusinessName>
            
            <ProfileBadge $profileType={profileType}>
              {profileType === 'private' && (language === 'bg' ? 'Частен Продавач' : 'Private Garage')}
              {isDealer && (language === 'bg' ? 'Дилър Автомобили' : 'Car Dealer')}
              {isCompany && (language === 'bg' ? 'Премиум Дилър' : 'Premium Dealership')}
            </ProfileBadge>

            <ContactRow>
              {businessAddress && (
                <ContactItem>
                  <MapPin size={14} />
                  {businessAddress}
                </ContactItem>
              )}
              {user.phoneNumber && (
                <ContactItem>
                  <Phone size={14} />
                  {user.phoneNumber}
                </ContactItem>
              )}
            </ContactRow>
          </InfoColumn>
        </ProfileSection>
      </HeroContent>
    </HeroHeader>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const HeroHeader = styled.div<{ $coverImage: string; $profileType: string }>`
  position: relative;
  height: 380px;
  width: 100%;
  background: url(${props => props.$coverImage}) center/cover no-repeat;
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  @media (max-width: 768px) {
    height: auto;
    min-height: 500px;
  }
`;

const HeroOverlay = styled.div<{ $profileType: string }>`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: ${props => {
    const color = getThemeColor(props.$profileType);
    return `linear-gradient(to top, ${color}F0 0%, ${color}CC 50%, transparent 100%)`;
  }};
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    gap: 24px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LogoWrapper = styled.div<{ $profileType: string }>`
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  border-radius: 20px;
  padding: 4px;
  background: ${props => getThemeGradient(props.$profileType)};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const ProfileAvatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  background: white;
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 3;
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const BusinessName = styled.h1<{ $profileType: string }>`
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const ProfileBadge = styled.div<{ $profileType: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => getThemeColor(props.$profileType)}DD;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: fit-content;
`;

const ContactRow = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 14px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);

  svg {
    opacity: 0.9;
  }
`;

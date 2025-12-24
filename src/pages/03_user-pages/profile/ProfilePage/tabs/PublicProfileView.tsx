// PublicProfileView.tsx - Professional Showroom Profile (Mobile.de Style)
import React, { useState, useMemo } from 'react';
import {
  MapPin, Phone, Globe, Mail, CheckCircle, 
  Clock, Search, Car, Award, Shield, TrendingUp
} from 'lucide-react';
import styled from 'styled-components';

import { useLanguage } from '../../../../../contexts/LanguageContext';
import CarCardGermanStyle from '../../../../../components/CarCard/CarCardGermanStyle';
import { FollowButton } from '../../../../../components/Profile/FollowButton';
import { CarListing } from '../../../../../types/CarListing';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import type { ProfileCar } from '../types';

interface PublicProfileViewProps {
  user: BulgarianUser;
  userCars?: ProfileCar[];
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user, userCars = [] }) => {
  const { language } = useLanguage();
  const [inventorySearch, setInventorySearch] = useState('');

  // Profile type detection
  const profileType = user.profileType || 'private';
  const isPrivate = profileType === 'private';
  const isDealer = profileType === 'dealer';
  const isCompany = profileType === 'company';

  // Business info extraction
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
  
  const businessWebsite = isDealer 
    ? user.dealerSnapshot?.website 
    : isCompany 
      ? user.companySnapshot?.website 
      : null;

  const coverImage = user.coverImage || (
    isCompany 
      ? 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1920&h=400&fit=crop' 
      : isDealer 
        ? 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&h=400&fit=crop'
        : 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&h=400&fit=crop'
  );

  // Filter cars
  const filteredCars = useMemo(() => {
    if (!inventorySearch) return userCars;
    const lower = inventorySearch.toLowerCase();
    return userCars.filter(car =>
      (car.make?.toLowerCase().includes(lower)) ||
      (car.model?.toLowerCase().includes(lower)) ||
      (car.year?.toString().includes(lower))
    );
  }, [userCars, inventorySearch]);

  return (
    <ShowroomContainer>
      {/* HERO HEADER WITH COVER IMAGE */}
      <HeroHeader $coverImage={coverImage} $profileType={profileType}>
        <HeroOverlay $profileType={profileType} />
        <HeroContent>
          {/* LEFT SIDE: Logo + Info */}
          <ProfileSection>
            <LogoWrapper $profileType={profileType}>
              <ProfileAvatar 
                src={user.photoURL || '/default-avatar.png'} 
                alt={businessName}
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
                {isPrivate && (language === 'bg' ? '🏠 Частен Продавач' : '🏠 Private Garage')}
                {isDealer && (language === 'bg' ? '🚗 Дилър Автомобили' : '🚗 Car Dealer')}
                {isCompany && (language === 'bg' ? '🏢 Премиум Дилър' : '🏢 Premium Dealership')}
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

          {/* RIGHT SIDE: Stats + Follow Button */}
          <ActionSection>
            <StatsGrid>
              <StatCard $profileType={profileType}>
                <StatValue>{userCars.length}</StatValue>
                <StatLabel>{language === 'bg' ? 'Обяви' : 'Listings'}</StatLabel>
              </StatCard>
              <StatCard $profileType={profileType}>
                <StatValue>{user.stats?.totalViews || 0}</StatValue>
                <StatLabel>{language === 'bg' ? 'Прегледи' : 'Views'}</StatLabel>
              </StatCard>
              <StatCard $profileType={profileType}>
                <StatValue>
                  {user.createdAt?.toDate?.() ? 
                    new Date().getFullYear() - user.createdAt.toDate().getFullYear() : 0}+
                </StatValue>
                <StatLabel>{language === 'bg' ? 'Години' : 'Years'}</StatLabel>
              </StatCard>
            </StatsGrid>

            <FollowButton 
              targetUserId={user.uid} 
              showCount={true}
              variant="outline"
              size="large"
            />
          </ActionSection>
        </HeroContent>
      </HeroHeader>

      {/* INFO BAR (Business Hours, Contact) */}
      <InfoBar $profileType={profileType}>
        <InfoBarLeft>
          <InfoBarItem>
            <Clock size={16} />
            <span>{language === 'bg' ? 'Отворено сега' : 'Open Now'}</span>
          </InfoBarItem>
          {businessWebsite && (
            <InfoBarItem>
              <Globe size={16} />
              <a href={businessWebsite} target="_blank" rel="noopener noreferrer">
                {language === 'bg' ? 'Уебсайт' : 'Website'}
              </a>
            </InfoBarItem>
          )}
          {user.email && (
            <InfoBarItem>
              <Mail size={16} />
              <span>{user.email}</span>
            </InfoBarItem>
          )}
        </InfoBarLeft>

        <InfoBarRight>
          {user.verification?.id && (
            <VerificationBadge>
              <Shield size={14} />
              {language === 'bg' ? 'Потвърден' : 'Verified'}
            </VerificationBadge>
          )}
        </InfoBarRight>
      </InfoBar>

      {/* INVENTORY SECTION */}
      <InventorySection>
        <Container>
          <InventoryHeader>
            <InventoryTitle $profileType={profileType}>
              <Car size={28} />
              {language === 'bg' ? 'Налични Автомобили' : 'Available Stock'}
              <InventoryCount>({filteredCars.length})</InventoryCount>
            </InventoryTitle>

            <SearchWrapper>
              <SearchIcon>
                <Search size={18} />
              </SearchIcon>
              <SearchInput
                placeholder={language === 'bg' ? 'Търсене в този магазин...' : 'Search in this store...'}
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </SearchWrapper>
          </InventoryHeader>

          {filteredCars.length > 0 ? (
            <CarGrid>
              {filteredCars.map(car => (
                <CarCardGermanStyle
                  key={car.id}
                  car={car as unknown as CarListing}
                  ownerProfileType={profileType}
                  ownerPlanTier={user.planTier}
                  ownerIsVerified={!!user.verification?.id}
                />
              ))}
            </CarGrid>
          ) : (
            <EmptyState>
              <Car size={48} color="#94A3B8" />
              <EmptyText>
                {inventorySearch 
                  ? (language === 'bg' ? 'Няма автомобили, отговарящи на търсенето' : 'No cars match your search')
                  : (language === 'bg' ? 'Няма налични автомобили в момента' : 'No cars available at the moment')
                }
              </EmptyText>
            </EmptyState>
          )}
        </Container>
      </InventorySection>

      {/* ABOUT SECTION */}
      {(user.bio || user.dealerSnapshot?.description) && (
        <AboutSection>
          <Container>
            <AboutTitle>{language === 'bg' ? 'За Нас' : 'About Us'}</AboutTitle>
            <AboutText>
              {user.dealerSnapshot?.description || user.companySnapshot?.description || user.bio}
            </AboutText>
          </Container>
        </AboutSection>
      )}

      {/* TRUST BADGES (For Business Accounts) */}
      {!isPrivate && (
        <TrustSection>
          <Container>
            <TrustGrid>
              <TrustBadge>
                <Shield size={32} color="#10B981" />
                <TrustTitle>{language === 'bg' ? 'Надежден Продавач' : 'Trusted Seller'}</TrustTitle>
                <TrustDesc>{language === 'bg' ? 'Потвърден и Проверен' : 'Verified & Authenticated'}</TrustDesc>
              </TrustBadge>
              <TrustBadge>
                <Award size={32} color="#3B82F6" />
                <TrustTitle>{language === 'bg' ? 'Гаранция за Качество' : 'Quality Guarantee'}</TrustTitle>
                <TrustDesc>{language === 'bg' ? 'Висококачествени Превозни Средства' : 'High-Quality Vehicles'}</TrustDesc>
              </TrustBadge>
              <TrustBadge>
                <TrendingUp size={32} color="#F59E0B" />
                <TrustTitle>{language === 'bg' ? 'Опит' : 'Experience'}</TrustTitle>
                <TrustDesc>{language === 'bg' ? 'Години Опит' : 'Years of Expertise'}</TrustDesc>
              </TrustBadge>
            </TrustGrid>
          </Container>
        </TrustSection>
      )}
    </ShowroomContainer>
  );
};

export default PublicProfileView;

// ============================================================================
// STYLED COMPONENTS (Mobile.de Premium Style)
// ============================================================================

const ShowroomContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #F8FAFC;
`;

// Theme colors based on profile type
const getThemeColor = (type: string) => {
  switch(type) {
    case 'company': return '#1E3A8A'; // Blue - Modern corporate
    case 'dealer': return '#059669'; // Green - Car showroom
    case 'private': return '#EA580C'; // Orange - Personal garage
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

// ===== HERO HEADER =====
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
`;

const ContactRow = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
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

// ===== ACTION SECTION =====
const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: stretch;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const StatCard = styled.div<{ $profileType: string }>`
  background: ${props => getThemeColor(props.$profileType)}DD;
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  min-width: 90px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: white;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ===== INFO BAR =====
const InfoBar = styled.div<{ $profileType: string }>`
  background: ${props => getThemeColor(props.$profileType)};
  color: white;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 16px 20px;
    flex-direction: column;
  }
`;

const InfoBarLeft = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 16px;
    justify-content: center;
  }
`;

const InfoBarRight = styled.div`
  display: flex;
  gap: 16px;
`;

const InfoBarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);

  svg {
    opacity: 0.9;
  }

  a {
    color: white;
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    transition: border-color 0.2s;

    &:hover {
      border-color: white;
    }
  }
`;

const VerificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(10px);
`;

// ===== INVENTORY SECTION =====
const InventorySection = styled.div`
  padding: 60px 0;
  background: white;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const InventoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InventoryTitle = styled.h2<{ $profileType: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 800;
  color: ${props => getThemeColor(props.$profileType)};
  margin: 0;

  svg {
    color: ${props => getThemeColor(props.$profileType)};
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const InventoryCount = styled.span`
  font-size: 24px;
  color: #64748B;
  font-weight: 600;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
  background: #F8FAFC;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #94A3B8;
  }
`;

const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #94A3B8;
`;

const EmptyText = styled.p`
  margin-top: 16px;
  font-size: 16px;
  color: #64748B;
`;

// ===== ABOUT SECTION =====
const AboutSection = styled.div`
  padding: 60px 0;
  background: #F8FAFC;
`;

const AboutTitle = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 20px;
`;

const AboutText = styled.p`
  font-size: 16px;
  line-height: 1.8;
  color: #475569;
  max-width: 900px;
`;

// ===== TRUST BADGES =====
const TrustSection = styled.div`
  padding: 60px 0;
  background: white;
`;

const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const TrustBadge = styled.div`
  text-align: center;
  padding: 32px;
  background: #F8FAFC;
  border-radius: 16px;
  border: 2px solid #E2E8F0;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: #CBD5E1;
  }
`;

const TrustTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
  margin: 16px 0 8px;
`;

const TrustDesc = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0;
`;

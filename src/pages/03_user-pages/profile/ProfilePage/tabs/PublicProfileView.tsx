// PublicProfileView.tsx - Read-only profile view for other users
import React, { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import { GarageCarousel } from '../../../../../components/Profile/GarageCarousel';
import CarCardGermanStyle from '../../../../../components/CarCard/CarCardGermanStyle';
import UserPostsFeed from '../../../../../components/Profile/UserPostsFeed';
import type { ProfileCar } from '../types';
import {
  User, Mail, Phone, MapPin, Calendar, Globe,
  Building2, Briefcase, Car, Shield, CheckCircle, FileText,
  Clock, Search, Filter
} from 'lucide-react';
import { CarListing } from '../../../../../types/CarListing';

interface PublicProfileViewProps {
  user: BulgarianUser;
  userCars?: ProfileCar[];
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user, userCars = [] }) => {
  const { language } = useLanguage();
  const [inventorySearch, setInventorySearch] = useState('');

  // Explicit type checking
  const isDealerProfile = user.profileType === 'dealer';
  const isCompanyProfile = user.profileType === 'company';
  const isBusinessAccount = isDealerProfile || isCompanyProfile;

  // Filter cars for Digital Showroom
  const filteredCars = useMemo(() => {
    if (!inventorySearch) return userCars;
    const lower = inventorySearch.toLowerCase();
    return userCars.filter(car =>
      (car.make?.toLowerCase().includes(lower)) ||
      (car.model?.toLowerCase().includes(lower))
    );
  }, [userCars, inventorySearch]);

  // --- DIGITAL SHOWROOM LAYOUT (Dealers/Companies) ---
  if (isBusinessAccount) {
    const businessName = isDealerProfile ? user.dealerSnapshot?.name : user.companySnapshot?.name;
    const businessAddress = isDealerProfile ? user.dealerSnapshot?.address : user.companySnapshot?.address;
    const businessWebsite = isDealerProfile ? user.dealerSnapshot?.website : user.companySnapshot?.website;
    const coverImage = user.coverImage || '/images/default-dealer-cover.jpg'; // Need a placeholder

    return (
      <ShowroomContainer>
        {/* HERO HEADER */}
        <ShowroomHeader $coverImage={coverImage}>
          <OverlayGradient />
          <HeaderContent>
            <BusinessLogo src={user.photoURL || '/default-avatar.png'} alt={businessName} />
            <HeaderText>
              <BusinessTitle>
                {businessName || user.displayName}
                {user.verification?.id && <CheckCircle size={24} color="#10B981" fill="white" />}
              </BusinessTitle>
              <BusinessSubtitle>
                {isCompanyProfile ? (language === 'bg' ? 'Премиум Партньор' : 'Premium Partner') : (language === 'bg' ? 'Оторизиран Дилър' : 'Authorized Dealer')}
                {' • '}
                <MapPin size={14} style={{ display: 'inline', marginBottom: -2 }} /> {businessAddress || (user.locationData?.cityName || 'Bulgaria')}
              </BusinessSubtitle>
            </HeaderText>
          </HeaderContent>
        </ShowroomHeader>

        {/* INFO BAR */}
        <InfoBar>
          <InfoBarItem>
            <Clock size={16} color="var(--success-main)" />
            <span>{language === 'bg' ? 'Отворено сега' : 'Open Now'}</span>
          </InfoBarItem>
          {user.phoneNumber && (
            <InfoBarItem>
              <Phone size={16} />
              <span>{user.phoneNumber}</span>
            </InfoBarItem>
          )}
          {businessWebsite && (
            <InfoBarItem>
              <Globe size={16} />
              <a href={businessWebsite} target="_blank" rel="noopener noreferrer">
                {language === 'bg' ? 'Уебсайт' : 'Website'}
              </a>
            </InfoBarItem>
          )}
          <InfoBarItem>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-main)' }}>
              {userCars.length} {language === 'bg' ? 'Автомобила' : 'Cars in Stock'}
            </span>
          </InfoBarItem>
        </InfoBar>

        {/* INVENTORY SECTION */}
        <ShowroomContent>
          <InventoryHeader>
            <h3>{language === 'bg' ? 'Наличен Автопарк' : 'Current Inventory'}</h3>
            <SearchWrapper>
              <Search size={18} color="var(--text-secondary)" />
              <SearchInput
                placeholder={language === 'bg' ? 'Търсене в този магазин...' : 'Search this stock...'}
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
                  car={car as unknown as CarListing} // Type casting for compatibility if ProfileCar differs slightly
                  ownerProfileType={user.profileType}
                  ownerPlanTier={user.planTier}
                  ownerIsVerified={user.verification?.id}
                />
              ))}
            </CarGrid>
          ) : (
            <EmptyState>
              {language === 'bg' ? 'Няма намерени автомобили.' : 'No cars found in this showroom.'}
            </EmptyState>
          )}
        </ShowroomContent>

        {/* ABOUT SECTION */}
        <AboutSection>
          <h3>{language === 'bg' ? 'За Нас' : 'About Us'}</h3>
          <p>{(isDealerProfile ? user.dealerSnapshot?.description : '') || user.bio || (language === 'bg' ? 'Няма описание.' : 'No description provided.')}</p>
        </AboutSection>
      </ShowroomContainer>
    );
  }

  // --- STANDARD PRIVATE PROFILE (Clean & Simple) ---
  return (
    <Container>
      <Layout>
        {/* Left Sidebar - Profile Summary */}
        <Sidebar>
          <ProfileCard>
            <Avatar src={user.photoURL || '/default-avatar.png'} alt={user.displayName} />
            <Name>{user.displayName || (language === 'bg' ? 'Анонимен' : 'Anonymous')}</Name>
            <ProfileTypeBadge>
              {language === 'bg' ? 'Частен Потребител' : 'Private Seller'}
            </ProfileTypeBadge>
          </ProfileCard>
          <StatsCard>
            <StatItem>
              <StatValue>{user.stats?.activeListings || 0}</StatValue>
              <StatLabel>{language === 'bg' ? 'Обяви' : 'Listings'}</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{user.createdAt?.toDate ? user.createdAt.toDate().getFullYear() : '2025'}</StatValue>
              <StatLabel>{language === 'bg' ? 'Член от' : 'Member Since'}</StatLabel>
            </StatItem>
          </StatsCard>
        </Sidebar>

        {/* Main Content Area */}
        <Content>
          {/* Cars */}
          {userCars && userCars.length > 0 && (
            <Section>
              <SectionHeader>
                <Car size={24} />
                <SectionTitle>
                  {language === 'bg' ? 'Обяви' : 'Active Listings'}
                </SectionTitle>
              </SectionHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {userCars.map(car => (
                  <CarCardGermanStyle
                    key={car.id}
                    car={car as unknown as CarListing}
                    ownerProfileType="private"
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Bio/Posts if needed */}
          {/* Removed for brevity in Private view to keep it clean, can be added back if requested */}
        </Content>
      </Layout>
    </Container>
  );
};

// --- STYLES FOR DIGITAL SHOWROOM ---
const ShowroomContainer = styled.div`
  width: 100%;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const ShowroomHeader = styled.div<{ $coverImage: string }>`
  height: 320px;
  width: 100%;
  background-image: url(${props => props.$coverImage});
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
`;

const OverlayGradient = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  display: flex;
  align-items: flex-end;
  gap: 24px;

  @media(max-width: 768px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
  }
`;

const BusinessLogo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 4px solid white;
  background: white;
  object-fit: contain;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
`;

const HeaderText = styled.div`
  color: white;
  margin-bottom: 10px;
`;

const BusinessTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);

  @media(max-width: 768px) {
      justify-content: center;
      font-size: 1.8rem;
  }
`;

const BusinessSubtitle = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media(max-width: 768px) {
      justify-content: center;
  }
`;

const InfoBar = styled.div`
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-primary);
  padding: 16px 0;
  display: flex;
  justify-content: center;
  gap: 40px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;

  @media(max-width: 768px) {
      gap: 16px;
      padding: 12px;
  }
`;

const InfoBarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
  
  a {
      color: var(--primary-main);
      text-decoration: none;
      &:hover { text-decoration: underline; }
  }
`;

const ShowroomContent = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const InventoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h3 {
      font-size: 1.5rem;
      font-weight: 700;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 300px;
  
  svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 40px;
  border-radius: 8px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-input);
  color: var(--text-primary);
  
  &:focus {
      outline: none;
      border-color: var(--primary-main);
  }
`;

const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 12px;
`;

const AboutSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 60px auto;
  padding: 30px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-primary);

  h3 { margin-top: 0; }
  p { line-height: 1.6; color: var(--text-secondary); }
`;

// --- STYLES FOR STANDARD PROFILE (Reused/Simplified) ---
const Container = styled.div`
  width: 100%;
  min-height: 600px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProfileCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
`;

const Name = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
`;

const ProfileTypeBadge = styled.div`
  padding: 4px 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StatsCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-main);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: var(--primary-main);
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
`;

export default PublicProfileView;

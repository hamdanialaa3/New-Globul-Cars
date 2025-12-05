// PublicProfileView.tsx - Read-only profile view for other users
import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import { GarageCarousel } from '../../../../../components/Profile/GarageCarousel';
import UserPostsFeed from '../../../../../components/Profile/UserPostsFeed';
import type { ProfileCar } from '../types';
import { 
  User, Mail, Phone, MapPin, Calendar, Globe, 
  Building2, Briefcase, Car, Shield, CheckCircle, FileText
} from 'lucide-react';

interface PublicProfileViewProps {
  user: BulgarianUser;
  userCars?: ProfileCar[];
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user, userCars = [] }) => {
  const { language } = useLanguage();

  const isBusinessAccount = user.accountType === 'business' || user.accountType === 'dealer' || user.accountType === 'company';
  const isDealerProfile = user.profileType === 'dealer';
  const isCompanyProfile = user.profileType === 'company';

  return (
    <Container>
      <Layout>
        {/* Left Sidebar - Profile Summary */}
        <Sidebar>
          <ProfileCard>
            <Avatar src={user.profileImage?.url || '/default-avatar.png'} alt={user.displayName} />
            <Name>{user.displayName || (language === 'bg' ? 'Анонимен' : 'Anonymous')}</Name>
            {user.verification?.isVerified && (
              <VerifiedBadge>
                <CheckCircle size={16} />
                {language === 'bg' ? 'Потвърден' : 'Verified'}
              </VerifiedBadge>
            )}
            <ProfileType>
              {user.profileType === 'private' && (language === 'bg' ? 'Частен' : 'Private')}
              {user.profileType === 'dealer' && (language === 'bg' ? 'Дилър' : 'Dealer')}
              {user.profileType === 'company' && (language === 'bg' ? 'Компания' : 'Company')}
            </ProfileType>
          </ProfileCard>

          <StatsCard>
            <StatItem>
              <StatValue>{user.stats?.activeListings || 0}</StatValue>
              <StatLabel>{language === 'bg' ? 'Обяви' : 'Listings'}</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{user.stats?.followers || 0}</StatValue>
              <StatLabel>{language === 'bg' ? 'Последователи' : 'Followers'}</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{user.stats?.following || 0}</StatValue>
              <StatLabel>{language === 'bg' ? 'Следва' : 'Following'}</StatLabel>
            </StatItem>
          </StatsCard>
        </Sidebar>

        {/* Main Content Area */}
        <Content>
          {/* Personal/Business Information */}
          <Section>
            <SectionHeader>
              <User size={24} />
              <SectionTitle>
                {language === 'bg' ? 'Информация за профила' : 'Profile Information'}
              </SectionTitle>
            </SectionHeader>

            <InfoGrid>
              {user.email && (
                <InfoItem>
                  <InfoIcon><Mail size={18} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>{language === 'bg' ? 'Имейл' : 'Email'}</InfoLabel>
                    <InfoValue>{user.email}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {user.phoneNumber && (
                <InfoItem>
                  <InfoIcon><Phone size={18} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>{language === 'bg' ? 'Телефон' : 'Phone'}</InfoLabel>
                    <InfoValue>{user.phoneNumber}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {user.location?.city && (
                <InfoItem>
                  <InfoIcon><MapPin size={18} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>{language === 'bg' ? 'Град' : 'City'}</InfoLabel>
                    <InfoValue>{user.location.city}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {user.location?.region && (
                <InfoItem>
                  <InfoIcon><Globe size={18} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>{language === 'bg' ? 'Регион' : 'Region'}</InfoLabel>
                    <InfoValue>{user.location.region}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {user.createdAt && (
                <InfoItem>
                  <InfoIcon><Calendar size={18} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>{language === 'bg' ? 'Член от' : 'Member Since'}</InfoLabel>
                    <InfoValue>
                      {new Date(user.createdAt).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {user.preferredLanguage && (
                <InfoItem>
                  <InfoIcon><Globe size={18} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>{language === 'bg' ? 'Език' : 'Language'}</InfoLabel>
                    <InfoValue>
                      {user.preferredLanguage === 'bg' ? 'Български' : 'English'}
                    </InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
            </InfoGrid>

            {user.bio && (
              <BioSection>
                <BioLabel>{language === 'bg' ? 'Биография' : 'Bio'}</BioLabel>
                <BioText>{user.bio}</BioText>
              </BioSection>
            )}
          </Section>

          {/* Business Information (Dealers/Companies) */}
          {isBusinessAccount && (isDealerProfile || isCompanyProfile) && (
            <Section>
              <SectionHeader>
                <Building2 size={24} />
                <SectionTitle>
                  {isDealerProfile 
                    ? (language === 'bg' ? 'Информация за дилъра' : 'Dealer Information')
                    : (language === 'bg' ? 'Информация за компанията' : 'Company Information')
                  }
                </SectionTitle>
              </SectionHeader>

              <InfoGrid>
                {user.dealerSnapshot?.name && (
                  <InfoItem>
                    <InfoIcon><Building2 size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>{language === 'bg' ? 'Име на фирмата' : 'Business Name'}</InfoLabel>
                      <InfoValue>{user.dealerSnapshot.name}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {user.companySnapshot?.name && (
                  <InfoItem>
                    <InfoIcon><Building2 size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>{language === 'bg' ? 'Име на компанията' : 'Company Name'}</InfoLabel>
                      <InfoValue>{user.companySnapshot.name}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {user.dealerSnapshot?.address && (
                  <InfoItem>
                    <InfoIcon><MapPin size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>{language === 'bg' ? 'Адрес' : 'Address'}</InfoLabel>
                      <InfoValue>{user.dealerSnapshot.address}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {user.companySnapshot?.bulstat && (
                  <InfoItem>
                    <InfoIcon><Shield size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>BULSTAT</InfoLabel>
                      <InfoValue>{user.companySnapshot.bulstat}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {user.companySnapshot?.vatNumber && (
                  <InfoItem>
                    <InfoIcon><Shield size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>VAT</InfoLabel>
                      <InfoValue>{user.companySnapshot.vatNumber}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {user.dealerSnapshot?.phone && (
                  <InfoItem>
                    <InfoIcon><Phone size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>{language === 'bg' ? 'Телефон' : 'Phone'}</InfoLabel>
                      <InfoValue>{user.dealerSnapshot.phone}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {user.dealerSnapshot?.email && (
                  <InfoItem>
                    <InfoIcon><Mail size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>{language === 'bg' ? 'Имейл' : 'Email'}</InfoLabel>
                      <InfoValue>{user.dealerSnapshot.email}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}

                {user.dealerSnapshot?.website && (
                  <InfoItem>
                    <InfoIcon><Globe size={18} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>{language === 'bg' ? 'Уебсайт' : 'Website'}</InfoLabel>
                      <InfoValue>
                        <a href={user.dealerSnapshot.website} target="_blank" rel="noopener noreferrer">
                          {user.dealerSnapshot.website}
                        </a>
                      </InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}
              </InfoGrid>

              {user.dealerSnapshot?.description && (
                <BioSection>
                  <BioLabel>{language === 'bg' ? 'За нас' : 'About Us'}</BioLabel>
                  <BioText>{user.dealerSnapshot.description}</BioText>
                </BioSection>
              )}
            </Section>
          )}

          {/* Activity & Stats */}
          <Section>
            <SectionHeader>
              <Car size={24} />
              <SectionTitle>
                {language === 'bg' ? 'Активност' : 'Activity'}
              </SectionTitle>
            </SectionHeader>

            <ActivityGrid>
              <ActivityCard>
                <ActivityIcon><Car size={24} /></ActivityIcon>
                <ActivityValue>{user.stats?.activeListings || 0}</ActivityValue>
                <ActivityLabel>{language === 'bg' ? 'Активни обяви' : 'Active Listings'}</ActivityLabel>
              </ActivityCard>

              <ActivityCard>
                <ActivityIcon><CheckCircle size={24} /></ActivityIcon>
                <ActivityValue>{user.stats?.soldCars || 0}</ActivityValue>
                <ActivityLabel>{language === 'bg' ? 'Продадени' : 'Sold'}</ActivityLabel>
              </ActivityCard>

              <ActivityCard>
                <ActivityIcon><User size={24} /></ActivityIcon>
                <ActivityValue>{user.stats?.followers || 0}</ActivityValue>
                <ActivityLabel>{language === 'bg' ? 'Последователи' : 'Followers'}</ActivityLabel>
              </ActivityCard>

              <ActivityCard>
                <ActivityIcon><Briefcase size={24} /></ActivityIcon>
                <ActivityValue>{user.stats?.totalListings || 0}</ActivityValue>
                <ActivityLabel>{language === 'bg' ? 'Общо обяви' : 'Total Listings'}</ActivityLabel>
              </ActivityCard>
            </ActivityGrid>
          </Section>

          {/* User's Cars Section */}
          {userCars && userCars.length > 0 && (
            <Section>
              <SectionHeader>
                <Car size={24} />
                <SectionTitle>
                  {language === 'bg' ? 'Автомобили' : 'Cars'}
                </SectionTitle>
              </SectionHeader>
              <GarageCarousel
                cars={userCars.map(car => ({
                  id: car.id,
                  make: car.make || '',
                  model: car.model || '',
                  year: car.year || 2000,
                  price: car.price || 0,
                  mainImage: car.mainImage || car.imageUrl,
                  imageUrl: car.imageUrl,
                  status: (car.status as any) || 'active',
                  views: car.views
                }))}
                userId={user.uid}
                isOwnProfile={false}
              />
            </Section>
          )}

          {/* User's Posts Section */}
          <Section>
            <SectionHeader>
              <FileText size={24} />
              <SectionTitle>
                {language === 'bg' ? 'Публикации' : 'Posts'}
              </SectionTitle>
            </SectionHeader>
            <UserPostsFeed 
              userId={user.uid}
              limit={10}
              showTitle={false}
            />
          </Section>
        </Content>
      </Layout>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  min-height: 600px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 0 12px;
    max-width: 100%;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 260px;
  box-sizing: border-box;
  
  @media (max-width: 968px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    max-width: 100%;
  }
`;

const ProfileCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 968px) {
    flex: 1;
    min-width: calc(50% - 6px);
    max-width: calc(50% - 6px);
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    min-width: 100%;
    max-width: 100%;
  }
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
  max-width: 80px;
  max-height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-primary);
  flex-shrink: 0;
  display: block;
  
  @media (max-width: 968px) {
    width: 60px;
    height: 60px;
    min-width: 60px;
    min-height: 60px;
    max-width: 60px;
    max-height: 60px;
  }
`;

const Name = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 968px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid #10B981;
  border-radius: 20px;
  color: #10B981;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ProfileType = styled.div`
  padding: 6px 12px;
  background: rgba(255, 143, 16, 0.15);
  border-radius: 20px;
  color: var(--accent-primary);
  font-size: 0.75rem;
  font-weight: 600;
`;

const StatsCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 968px) {
    flex: 1;
    min-width: calc(50% - 6px);
    max-width: calc(50% - 6px);
    padding: 10px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    min-width: 100%;
    max-width: 100%;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-primary);
  
  @media (max-width: 968px) {
    font-size: 1.1rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-align: center;
  word-break: break-word;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const Section = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-primary);
  color: var(--accent-primary);
  margin-bottom: 20px;
  
  svg {
    flex-shrink: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
`;

const InfoIcon = styled.div`
  color: var(--accent-primary);
  flex-shrink: 0;
  margin-top: 2px;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  color: var(--text-primary);
  word-break: break-word;
  
  a {
    color: var(--accent-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BioSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-primary);
`;

const BioLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const BioText = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ActivityCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const ActivityIcon = styled.div`
  color: var(--accent-primary);
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ActivityValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ActivityLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
  word-break: break-word;
`;

export default PublicProfileView;

// PublicProfileView.tsx - Read-only profile view for other users
import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/coreLanguageContext';
import type { BulgarianUser } from '@globul-cars/coreuser/bulgarian-user.types';
import { 
  User, Mail, Phone, MapPin, Calendar, Globe, 
  Building2, Briefcase, Car, Shield, CheckCircle 
} from 'lucide-react';

interface PublicProfileViewProps {
  user: BulgarianUser;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user }) => {
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
        </Content>
      </Layout>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  min-height: 600px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 968px) {
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 968px) {
    flex: 1;
    min-width: 250px;
  }
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid ${({ theme }) => theme.colors.primary.main};
`;

const Name = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  text-align: center;
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
  font-size: 0.875rem;
  font-weight: 600;
`;

const ProfileType = styled.div`
  padding: 6px 16px;
  background: ${({ theme }) => theme.colors.primary.main}20;
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: 0.875rem;
  font-weight: 600;
`;

const StatsCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 16px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 968px) {
    flex: 1;
    min-width: 250px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 16px;
  padding: 32px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: 12px;
`;

const InfoIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-word;
  
  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BioSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const BioLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 12px;
`;

const BioText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActivityCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: 12px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const ActivityIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ActivityValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ActivityLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export default PublicProfileView;

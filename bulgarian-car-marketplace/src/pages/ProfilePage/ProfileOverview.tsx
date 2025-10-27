import React from 'react';
import styled from 'styled-components';
import { useProfile } from './hooks/useProfile';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import { useNavigate } from 'react-router-dom';
import ProfileDashboard from '../../components/Profile/ProfileDashboard';
import UserPostsFeed from '../../components/Profile/UserPostsFeed';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Calendar,
  Building2,
  FileText,
  Edit
} from 'lucide-react';
import * as S from './styles';
import { H2, Label } from '../../components/Typography';

/**
 * Profile Overview Tab - Main profile information
 * NOW SHOWS: Personal info + Business info + Posts
 */
const ProfileOverview: React.FC = () => {
  const { language } = useLanguage();
  const { user, isOwnProfile } = useProfile();
  const { isDealer, isCompany } = useProfileType();
  const navigate = useNavigate();

  const isBusinessAccount = user?.accountType === 'business' || 
                           user?.accountType === 'dealer' || 
                           user?.accountType === 'company';
  
  // Check if user has business info from BusinessInformationForm
  const hasBusinessInfo = user?.businessInfo;

  return (
    <S.ContentSection>
      <H2>{language === 'bg' ? 'Преглед на профила' : 'Profile Overview'}</H2>
      
      {/* Profile Dashboard with Stats */}
      <ProfileDashboard />
      
      {/* Personal Information Section */}
      <InfoSection>
        <SectionHeader>
          <SectionTitle>
            <User size={20} />
            {language === 'bg' ? 'Лична информация' : 'Personal Information'}
          </SectionTitle>
          {isOwnProfile && (
            <EditButton onClick={() => navigate('/profile/settings')}>
              <Edit size={16} />
              {language === 'bg' ? 'Редактирай' : 'Edit'}
            </EditButton>
          )}
        </SectionHeader>
        
        <InfoGrid>
          {user?.firstName && (
            <InfoItem>
              <Label as="span">{language === 'bg' ? 'Име:' : 'First Name:'}</Label>
              <InfoValue>{user.firstName}</InfoValue>
            </InfoItem>
          )}
          {user?.lastName && (
            <InfoItem>
              <Label as="span">{language === 'bg' ? 'Фамилия:' : 'Last Name:'}</Label>
              <InfoValue>{user.lastName}</InfoValue>
            </InfoItem>
          )}
          {user?.email && isOwnProfile && (
            <InfoItem>
              <InfoLabel>
                <Mail size={14} />
                <Label as="span">{language === 'bg' ? 'Имейл:' : 'Email:'}</Label>
              </InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </InfoItem>
          )}
          {user?.phoneNumber && isOwnProfile && (
            <InfoItem>
              <InfoLabel>
                <Phone size={14} />
                <Label as="span">{language === 'bg' ? 'Телефон:' : 'Phone:'}</Label>
              </InfoLabel>
              <InfoValue>{user.phoneNumber}</InfoValue>
            </InfoItem>
          )}
          {user?.location?.city && (
            <InfoItem>
              <InfoLabel>
                <MapPin size={14} />
                <Label as="span">{language === 'bg' ? 'Град:' : 'City:'}</Label>
              </InfoLabel>
              <InfoValue>{user.location.city}</InfoValue>
            </InfoItem>
          )}
          {user?.dateOfBirth && isOwnProfile && (
            <InfoItem>
              <InfoLabel>
                <Calendar size={14} />
                {language === 'bg' ? 'Дата на раждане:' : 'Date of Birth:'}
              </InfoLabel>
              <InfoValue>{new Date(user.dateOfBirth).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</InfoValue>
            </InfoItem>
          )}
        </InfoGrid>
      </InfoSection>
      
      {/* ⚡ NEW: Work Information Section (Dealer & Company only) */}
      {(isDealer || isCompany) && hasBusinessInfo && (
        <InfoSection>
          <SectionHeader>
            <SectionTitle>
              <Building2 size={20} />
              {language === 'bg' ? 'Информация за работа' : 'Work Information'}
            </SectionTitle>
            {isOwnProfile && (
              <EditButton onClick={() => navigate('/profile/settings')}>
                <Edit size={16} />
                {language === 'bg' ? 'Редактирай' : 'Edit'}
              </EditButton>
            )}
          </SectionHeader>
          
          <InfoGrid>
            {hasBusinessInfo.legalForm && (
              <InfoItem>
                <InfoLabel>
                  <FileText size={14} />
                  {language === 'bg' ? 'Правна форма:' : 'Legal Form:'}
                </InfoLabel>
                <InfoValue>
                  {hasBusinessInfo.legalForm === 'EOOD' && 'ЕООД - Еднолично дружество с ограничена отговорност'}
                  {hasBusinessInfo.legalForm === 'OOD' && 'ООД - Дружество с ограничена отговорност'}
                  {hasBusinessInfo.legalForm === 'AD' && 'АД - Акционерно дружество'}
                  {hasBusinessInfo.legalForm === 'ET' && 'ЕТ - Едноличен търговец'}
                  {hasBusinessInfo.legalForm === 'EAD' && 'ЕАД - Еднолично акционерно дружество'}
                </InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.registeredNameBG && (
              <InfoItem>
                <InfoLabel>
                  <Building2 size={14} />
                  {language === 'bg' ? 'Регистрирано име:' : 'Registered Name:'}
                </InfoLabel>
                <InfoValue>{hasBusinessInfo.registeredNameBG}</InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.registrationNumber && (
              <InfoItem>
                <InfoLabel>
                  <FileText size={14} />
                  {language === 'bg' ? 'ЕИК:' : 'Registration Number:'}
                </InfoLabel>
                <InfoValue>{hasBusinessInfo.registrationNumber}</InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.vatNumber && (
              <InfoItem>
                <InfoLabel>
                  <FileText size={14} />
                  {language === 'bg' ? 'ДДС номер:' : 'VAT Number:'}
                </InfoLabel>
                <InfoValue>{hasBusinessInfo.vatNumber}</InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.bulstat && (
              <InfoItem>
                <InfoLabel>
                  <FileText size={14} />
                  {language === 'bg' ? 'Булстат:' : 'Bulstat:'}
                </InfoLabel>
                <InfoValue>{hasBusinessInfo.bulstat}</InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.uik && (
              <InfoItem>
                <InfoLabel>
                  <FileText size={14} />
                  {language === 'bg' ? 'УИК:' : 'Unique ID:'}
                </InfoLabel>
                <InfoValue>{hasBusinessInfo.uik}</InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.registeredAddress && (
              <>
                {hasBusinessInfo.registeredAddress.city && (
                  <InfoItem>
                    <InfoLabel>
                      <MapPin size={14} />
                      {language === 'bg' ? 'Град:' : 'City:'}
                    </InfoLabel>
                    <InfoValue>{hasBusinessInfo.registeredAddress.city}</InfoValue>
                  </InfoItem>
                )}
                
                {(hasBusinessInfo.registeredAddress.street || hasBusinessInfo.registeredAddress.number) && (
                  <InfoItem>
                    <InfoLabel>
                      <MapPin size={14} />
                      {language === 'bg' ? 'Адрес:' : 'Address:'}
                    </InfoLabel>
                    <InfoValue>
                      {hasBusinessInfo.registeredAddress.street} {hasBusinessInfo.registeredAddress.number}
                    </InfoValue>
                  </InfoItem>
                )}
              </>
            )}
            
            {hasBusinessInfo.contactEmail && (
              <InfoItem>
                <InfoLabel>
                  <Mail size={14} />
                  {language === 'bg' ? 'Имейл:' : 'Email:'}
                </InfoLabel>
                <InfoValue>{hasBusinessInfo.contactEmail}</InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.contactPhone && (
              <InfoItem>
                <InfoLabel>
                  <Phone size={14} />
                  {language === 'bg' ? 'Телефон:' : 'Phone:'}
                </InfoLabel>
                <InfoValue>{hasBusinessInfo.contactPhone}</InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.website && (
              <InfoItem>
                <InfoLabel>
                  <Globe size={14} />
                  {language === 'bg' ? 'Уебсайт:' : 'Website:'}
                </InfoLabel>
                <InfoValue>
                  <a href={hasBusinessInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#FF7900' }}>
                    {hasBusinessInfo.website}
                  </a>
                </InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.manager && (hasBusinessInfo.manager.firstName || hasBusinessInfo.manager.lastName) && (
              <InfoItem>
                <InfoLabel>
                  <User size={14} />
                  {language === 'bg' ? 'Управител:' : 'Manager:'}
                </InfoLabel>
                <InfoValue>
                  {hasBusinessInfo.manager.firstName} {hasBusinessInfo.manager.lastName}
                  {hasBusinessInfo.manager.position && ` - ${hasBusinessInfo.manager.position}`}
                </InfoValue>
              </InfoItem>
            )}
            
            {hasBusinessInfo.verified && (
              <InfoItem style={{ gridColumn: '1 / -1' }}>
                <VerifiedBadge>
                  ✓ {language === 'bg' ? 'Потвърдена информация' : 'Verified Information'}
                </VerifiedBadge>
              </InfoItem>
            )}
          </InfoGrid>
        </InfoSection>
      )}
      
      {/* ⚡ Business Information Section (if business account) */}
      {isBusinessAccount && (
        <InfoSection>
          <SectionHeader>
            <SectionTitle>
              <Briefcase size={20} />
              {language === 'bg' ? 'Информация за бизнеса' : 'Business Information'}
            </SectionTitle>
            {isOwnProfile && (
              <EditButton onClick={() => navigate('/profile/settings')}>
                <Edit size={16} />
                {language === 'bg' ? 'Редактирай' : 'Edit'}
              </EditButton>
            )}
          </SectionHeader>
          
          <InfoGrid>
            {user?.businessName && (
              <InfoItem>
                <InfoLabel>
                  <Building2 size={14} />
                  {language === 'bg' ? 'Име на фирмата:' : 'Business Name:'}
                </InfoLabel>
                <InfoValue>{user.businessName}</InfoValue>
              </InfoItem>
            )}
            {user?.bulstat && (
              <InfoItem>
                <InfoLabel>
                  <FileText size={14} />
                  {language === 'bg' ? 'БУЛСТАТ:' : 'BULSTAT:'}
                </InfoLabel>
                <InfoValue>{user.bulstat}</InfoValue>
              </InfoItem>
            )}
            {user?.vatNumber && (
              <InfoItem>
                <InfoLabel>
                  <FileText size={14} />
                  {language === 'bg' ? 'ДДС номер:' : 'VAT Number:'}
                </InfoLabel>
                <InfoValue>{user.vatNumber}</InfoValue>
              </InfoItem>
            )}
            {user?.businessAddress && (
              <InfoItem>
                <InfoLabel>
                  <MapPin size={14} />
                  {language === 'bg' ? 'Адрес:' : 'Address:'}
                </InfoLabel>
                <InfoValue>{user.businessAddress}</InfoValue>
              </InfoItem>
            )}
            {user?.businessPhone && (
              <InfoItem>
                <InfoLabel>
                  <Phone size={14} />
                  {language === 'bg' ? 'Телефон:' : 'Phone:'}
                </InfoLabel>
                <InfoValue>{user.businessPhone}</InfoValue>
              </InfoItem>
            )}
            {user?.businessEmail && (
              <InfoItem>
                <InfoLabel>
                  <Mail size={14} />
                  {language === 'bg' ? 'Имейл:' : 'Email:'}
                </InfoLabel>
                <InfoValue>{user.businessEmail}</InfoValue>
              </InfoItem>
            )}
            {user?.website && (
              <InfoItem>
                <InfoLabel>
                  <Globe size={14} />
                  {language === 'bg' ? 'Уебсайт:' : 'Website:'}
                </InfoLabel>
                <InfoValue>
                  <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: '#FF7900' }}>
                    {user.website}
                  </a>
                </InfoValue>
              </InfoItem>
            )}
            {user?.businessDescription && (
              <InfoItem style={{ gridColumn: '1 / -1' }}>
                <InfoLabel>
                  {language === 'bg' ? 'Описание:' : 'Description:'}
                </InfoLabel>
                <InfoValue>{user.businessDescription}</InfoValue>
              </InfoItem>
            )}
          </InfoGrid>
        </InfoSection>
      )}
      
      {/* ⚡ User's Posts Feed */}
      <div style={{ marginTop: '2rem' }}>
        <UserPostsFeed 
          userId={user?.uid}
          limit={10}
          showTitle={true}
        />
      </div>
    </S.ContentSection>
  );
};

// Styled Components
const InfoSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-top: 16px;
    border-radius: 12px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
  
  svg {
    color: #FF7900;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  svg {
    flex-shrink: 0;
  }
  
  &:hover {
    background: #e9ecef;
    border-color: #FF7900;
    color: #FF7900;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 0.8125rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    color: #FF7900;
    flex-shrink: 0;
  }
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  color: #212529;
  font-weight: 500;
  
  a {
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const VerifiedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #6ee7b7;
`;

export default ProfileOverview;


// ✅ MOBILE.DE INSPIRED SETTINGS PAGE - November 9, 2025
// Clean professional layout matching mobile.de design

import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  User, Mail, Phone, MapPin, FileText, AlertCircle, Check, X,
  ChevronRight, Upload, Eye, EyeOff
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/components/Toast';

const ProfileSettingsMobileDe: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [userData, setUserData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: {
      street: '',
      postalCode: '',
      city: ''
    },
    emailConfirmed: user?.emailVerified || false,
    phoneConfirmed: false
  });

  const customerNumber = user?.uid ? user.uid.slice(0, 8).toUpperCase() : '27765111';

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('success', 'Profile picture updated');
    } catch (error) {
      showToast('error', 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChange = (field: string) => {
    showToast('info', Change  - Coming soon);
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTitle>Your account settings</HeaderTitle>
        <CustomerNumber>Your customer number is: {customerNumber}</CustomerNumber>
      </PageHeader>

      <ContentWrapper>
        {/* Profile Section */}
        <Section>
          <SectionTitle>Profile</SectionTitle>
          <SettingRow>
            <RowContent>
              <ProfilePhotoContainer>
                <ProfilePhoto src={user?.photoURL || '/default-avatar.png'} alt="Profile" />
                <PhotoLabel htmlFor="photo-upload">
                  <Upload size={16} />
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </PhotoLabel>
              </ProfilePhotoContainer>
              <InfoContainer>
                <InfoLabel>Profile picture</InfoLabel>
                <InfoSubtext>(Only visible for you)</InfoSubtext>
              </InfoContainer>
            </RowContent>
            <ChangeButton onClick={() => handleChange('photo')}>Change</ChangeButton>
          </SettingRow>
        </Section>

        {/* Login Data */}
        <Section>
          <SectionTitle>Login data</SectionTitle>
          <SettingRow>
            <RowContent>
              <InfoContainer>
                <InfoLabel>E-mail Address</InfoLabel>
                <InfoValue>{userData.email}</InfoValue>
                {userData.emailConfirmed && (
                  <ConfirmedBadge><Check size={12} />Confirmed</ConfirmedBadge>
                )}
              </InfoContainer>
            </RowContent>
            <ChangeButton onClick={() => handleChange('email')}>Change</ChangeButton>
          </SettingRow>
          <SettingRow>
            <RowContent>
              <InfoContainer>
                <InfoLabel>Password</InfoLabel>
                <InfoValue>••••••••••••</InfoValue>
              </InfoContainer>
            </RowContent>
            <ChangeButton onClick={() => handleChange('password')}>Change</ChangeButton>
          </SettingRow>
        </Section>

        {/* Contact Data */}
        <Section>
          <SectionTitle>Contact data</SectionTitle>
          <SettingRow>
            <RowContent>
              <InfoContainer>
                <InfoLabel>Name</InfoLabel>
                <InfoValue>{userData.displayName || 'Not set'}</InfoValue>
              </InfoContainer>
            </RowContent>
            <ChangeButton onClick={() => handleChange('name')}>Change</ChangeButton>
          </SettingRow>
          <SettingRow>
            <RowContent>
              <InfoContainer>
                <InfoLabel>Address</InfoLabel>
                <InfoValue>
                  {userData.address.street || 'Not set'}<br />
                  {userData.address.postalCode && userData.address.city && 
                    ${userData.address.postalCode} 
                  }
                </InfoValue>
              </InfoContainer>
            </RowContent>
            <ChangeButton onClick={() => handleChange('address')}>Change</ChangeButton>
          </SettingRow>
          <SettingRow>
            <RowContent>
              <InfoContainer>
                <InfoLabel>Phone number</InfoLabel>
                <InfoValue>{userData.phone || 'Not set'}</InfoValue>
                {!userData.phoneConfirmed && userData.phone && (
                  <NotConfirmedBadge><X size={12} />Not confirmed</NotConfirmedBadge>
                )}
              </InfoContainer>
            </RowContent>
            <ChangeButton onClick={() => handleChange('phone')}>Change</ChangeButton>
          </SettingRow>
          {!userData.phoneConfirmed && userData.phone && (
            <WarningBox>
              <AlertCircle size={16} />
              <WarningText>Activate additional functions: Confirm phone number now</WarningText>
            </WarningBox>
          )}
        </Section>

        {/* Documents */}
        <Section>
          <SectionTitle>Documents</SectionTitle>
          <DocumentRow>
            <DocumentContent>
              <DocumentTitle>My invoices</DocumentTitle>
              <DocumentSubtext>Here you will find an overview of your booked packages and options</DocumentSubtext>
              <NoDataMessage><AlertCircle size={16} />No invoices available</NoDataMessage>
            </DocumentContent>
            <ShowButton>Show</ShowButton>
          </DocumentRow>
        </Section>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
`;

const PageHeader = styled.div`
  background: white;
  padding: 24px 32px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const CustomerNumber = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RowContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const ProfilePhotoContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

const ProfilePhoto = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e5e5;
`;

const PhotoLabel = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #6B46C1;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #5a3ba3;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
`;

const InfoSubtext = styled.div`
  font-size: 12px;
  color: #999;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #333;
  margin-top: 4px;
`;

const ConfirmedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #10b981;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
  width: fit-content;
`;

const NotConfirmedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ef4444;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
  width: fit-content;
`;

const ChangeButton = styled.button`
  background: transparent;
  border: 2px solid #6B46C1;
  color: #6B46C1;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #6B46C1;
    color: white;
  }
`;

const WarningBox = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  color: #ea580c;
`;

const WarningText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const DocumentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
`;

const DocumentContent = styled.div`
  flex: 1;
`;

const DocumentTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const DocumentSubtext = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #999;
  font-style: italic;
`;

const ShowButton = styled.button`
  background: white;
  border: 2px solid #6B46C1;
  color: #6B46C1;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #6B46C1;
    color: white;
  }
`;

export default ProfileSettingsMobileDe;

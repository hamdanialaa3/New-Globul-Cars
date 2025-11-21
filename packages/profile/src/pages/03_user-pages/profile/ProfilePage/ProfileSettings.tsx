/**
 * @deprecated This file is deprecated as of November 8, 2025
 * 
 * Use ProfileSettingsMobileDe.tsx instead for the active settings page.
 * 
 * This file is kept for legacy access via /profile/settings-old route only.
 * All new development should be done in ProfileSettingsMobileDe.tsx.
 * 
 * Route mapping:
 * - /profile/settings → ProfileSettingsMobileDe.tsx (ACTIVE)
 * - /profile/settings-old → ProfileSettings.tsx (THIS FILE - DEPRECATED)
 * - /profile/settings-new → ProfileSettingsNew.tsx (DEPRECATED)
 */

// ProfileSettings.tsx - mobile.de Style (Simple & Clean)
// ✅ SIMPLE DESIGN - Exactly like mobile.de screenshot

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { useProfile } from '@globul-cars/coreuseProfile';
import PasswordChangeModal from '@globul-cars/ui/componentsProfile/Modals/PasswordChangeModal';
import PhoneVerificationModal from '@globul-cars/ui/componentsProfile/Modals/PhoneVerificationModal';
import EmailVerificationModal from '@globul-cars/ui/componentsProfile/Modals/EmailVerificationModal';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// ==================== SIMPLE STYLED COMPONENTS ====================

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 8px 0;
`;

const CustomerNumber = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 40px 0;
  
  strong {
    color: #000;
    font-weight: 600;
  }
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
`;

const CardValue = styled.div`
  font-size: 1rem;
  color: #000;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $type: 'success' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => p.$type === 'success' ? '#e8f5e9' : '#ffebee'};
  color: ${p => p.$type === 'success' ? '#2e7d32' : '#c62828'};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ChangeButton = styled.button`
  padding: 8px 20px;
  background: white;
  color: #ff7900;
  border: 2px solid #ff7900;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #ff7900;
    color: white;
  }
  
  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const ProfileCard = styled(Card)`
  padding: 24px;
`;

const ProfileContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${p => p.$imageUrl 
    ? `url(${p.$imageUrl})` 
    : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'};
  background-size: cover;
  background-position: center;
  border: 3px solid #ff7900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: #999;
    width: 32px;
    height: 32px;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
`;

const ProfileNote = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const AlertBox = styled.div<{ $type: 'warning' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${p => p.$type === 'warning' ? '#fff3e0' : '#e3f2fd'};
  border-left: 4px solid ${p => p.$type === 'warning' ? '#ff9800' : '#2196f3'};
  border-radius: 6px;
  margin-top: 12px;
  
  svg {
    color: ${p => p.$type === 'warning' ? '#ff9800' : '#2196f3'};
    flex-shrink: 0;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #333;
    
    a {
      color: ${p => p.$type === 'warning' ? '#ff9800' : '#2196f3'};
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 0.9rem;
  color: #666;
  
  svg {
    color: #999;
    flex-shrink: 0;
  }
`;

// ==================== COMPONENT ====================

const ProfileSettings: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { user } = useProfile();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // ✅ VERIFICATION: Log to console
  console.log('✅ SIMPLE DESIGN LOADED - ProfileSettings.tsx - November 8, 2025');

  const customerNumber = currentUser?.uid ? currentUser.uid.substring(0, 8).toUpperCase() : '00000000';

  const getText = () => {
    if (language === 'bg') {
      return {
        pageTitle: 'Настройки на акаунта',
        customerNumber: 'Вашият клиентски номер е:',
        profile: 'Профил',
        profilePicture: 'Профилна снимка',
        onlyVisibleForYou: '(Видимо само за вас)',
        loginData: 'Данни за вход',
        email: 'Имейл адрес',
        password: 'Парола',
        contactData: 'Данни за контакт',
        name: 'Име',
        address: 'Адрес',
        phoneNumber: 'Телефонен номер',
        documents: 'Документи',
        myInvoices: 'Моите фактури',
        invoicesDesc: 'Тук ще намерите преглед на вашите закупени пакети и опции',
        confirmed: 'Потвърден',
        notConfirmed: 'Непотвърден',
        change: 'Промяна',
        show: 'Покажи',
        activateFunctions: 'Активирайте допълнителни функции:',
        confirmPhoneNow: 'Потвърдете телефонния номер сега',
        noInvoices: 'Няма налични фактури',
        notSet: 'Не е зададено'
      };
    } else {
      return {
        pageTitle: 'Your account settings',
        customerNumber: 'Your customer number is:',
        profile: 'Profile',
        profilePicture: 'Profile picture',
        onlyVisibleForYou: '(Only visible for you)',
        loginData: 'Login data',
        email: 'E-mail Address',
        password: 'Password',
        contactData: 'Contact data',
        name: 'Name',
        address: 'Address',
        phoneNumber: 'Phone number',
        documents: 'Documents',
        myInvoices: 'My Invoices',
        invoicesDesc: 'Here you will find an overview of your booked packages and options',
        confirmed: 'Confirmed',
        notConfirmed: 'Not confirmed',
        change: 'Change',
        show: 'Show',
        activateFunctions: 'Activate additional functions:',
        confirmPhoneNow: 'Confirm phone number now',
        noInvoices: 'No Invoices available',
        notSet: 'Not set'
      };
    }
  };

  const text = getText();

  return (
    <PageContainer>
      {/* Page Title */}
      <PageTitle>{text.pageTitle}</PageTitle>
      <CustomerNumber>
        {text.customerNumber} <strong>{customerNumber}</strong>
      </CustomerNumber>

      {/* Profile Section */}
      <Section>
        <SectionTitle>{text.profile}</SectionTitle>
        <ProfileCard>
          <ProfileContent>
            <Avatar $imageUrl={user?.photoURL}>
              {!user?.photoURL && <User size={32} />}
            </Avatar>
            <ProfileInfo>
              <ProfileLabel>{text.profilePicture}</ProfileLabel>
              <ProfileNote>{text.onlyVisibleForYou}</ProfileNote>
            </ProfileInfo>
          </ProfileContent>
          <ChangeButton>
            <Camera size={16} style={{ marginRight: '6px', display: 'inline' }} />
            {text.change}
          </ChangeButton>
        </ProfileCard>
      </Section>

      {/* Login Data Section */}
      <Section>
        <SectionTitle>{text.loginData}</SectionTitle>
        
        {/* Email */}
        <Card>
          <CardContent>
            <CardLabel>{text.email}</CardLabel>
            <CardValue>
              {user?.email || text.notSet}
              {user?.verification?.emailVerified && (
                <Badge $type="success">
                  <CheckCircle size={14} />
                  {text.confirmed}
                </Badge>
              )}
            </CardValue>
          </CardContent>
          <ChangeButton onClick={() => setShowEmailModal(true)}>
            {text.change}
          </ChangeButton>
        </Card>

        {/* Password */}
        <Card>
          <CardContent>
            <CardLabel>{text.password}</CardLabel>
            <CardValue>••••••••</CardValue>
          </CardContent>
          <ChangeButton onClick={() => setShowPasswordModal(true)}>
            {text.change}
          </ChangeButton>
        </Card>
      </Section>

      {/* Contact Data Section */}
      <Section>
        <SectionTitle>{text.contactData}</SectionTitle>
        
        {/* Name */}
        <Card>
          <CardContent>
            <CardLabel>{text.name}</CardLabel>
            <CardValue>
              {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || text.notSet}
            </CardValue>
          </CardContent>
          <ChangeButton>{text.change}</ChangeButton>
        </Card>

        {/* Address */}
        <Card>
          <CardContent>
            <CardLabel>{text.address}</CardLabel>
            <CardValue>
              {user?.address && user?.location?.city 
                ? `${user.address}, ${user.location.city}${user.postalCode ? ' ' + user.postalCode : ''}`
                : text.notSet}
            </CardValue>
          </CardContent>
          <ChangeButton>{text.change}</ChangeButton>
        </Card>

        {/* Phone Number */}
        <Card>
          <CardContent>
            <CardLabel>{text.phoneNumber}</CardLabel>
            <CardValue>
              {user?.phoneNumber || text.notSet}
              {user?.phoneNumber && (
                user?.verification?.phoneVerified ? (
                  <Badge $type="success">
                    <CheckCircle size={14} />
                    {text.confirmed}
                  </Badge>
                ) : (
                  <Badge $type="error">
                    <AlertCircle size={14} />
                    {text.notConfirmed}
                  </Badge>
                )
              )}
            </CardValue>
          </CardContent>
          <ChangeButton onClick={() => setShowPhoneModal(true)}>
            {text.change}
          </ChangeButton>
        </Card>

        {/* Phone Verification Alert */}
        {user?.phoneNumber && !user?.verification?.phoneVerified && (
          <AlertBox $type="warning">
            <AlertCircle size={20} />
            <p>
              {text.activateFunctions}{' '}
              <a onClick={() => setShowPhoneModal(true)}>
                {text.confirmPhoneNow}
              </a>
            </p>
          </AlertBox>
        )}
      </Section>

      {/* Documents Section */}
      <Section>
        <SectionTitle>{text.documents}</SectionTitle>
        
        <Card>
          <CardContent>
            <CardLabel>{text.myInvoices}</CardLabel>
            <CardValue style={{ fontSize: '0.875rem', color: '#666', fontWeight: 400 }}>
              {text.invoicesDesc}
            </CardValue>
          </CardContent>
          <ChangeButton>{text.show}</ChangeButton>
        </Card>

        <InfoMessage>
          <Info size={18} />
          <span>{text.noInvoices}</span>
        </InfoMessage>
      </Section>

      {/* Modals */}
      {showPasswordModal && (
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showPhoneModal && (
        <PhoneVerificationModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          phoneNumber={user?.phoneNumber}
        />
      )}

      {showEmailModal && (
        <EmailVerificationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </PageContainer>
  );
};

export default ProfileSettings;

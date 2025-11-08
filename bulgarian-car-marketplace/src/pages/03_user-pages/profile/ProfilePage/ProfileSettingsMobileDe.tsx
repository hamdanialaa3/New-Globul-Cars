// ProfileSettingsMobileDe.tsx - Marketplace-Inspired Settings
// 🎨 Two-Column Layout with Sidebar Navigation

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfile } from './hooks/useProfile';
import PasswordChangeModal from '@/components/Profile/Modals/PasswordChangeModal';
import PhoneVerificationModal from '@/components/Profile/Modals/PhoneVerificationModal';
import EmailVerificationModal from '@/components/Profile/Modals/EmailVerificationModal';
import NameEditModal from '@/components/Profile/Modals/NameEditModal';
import LocationEditModal from '@/components/Profile/Modals/LocationEditModal';
import PhotoEditModal from '@/components/Profile/Modals/PhotoEditModal';
import { 
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  FileText,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Camera,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Wifi,
  WifiOff,
  Info
} from 'lucide-react';

// ==================== TWO-COLUMN LAYOUT ====================
// Left: Sidebar Navigation | Right: Content Cards

const PageContainer = styled.div`
  background: #f5f5f5;
  min-height: 100vh;
  padding: 40px 0;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 30px;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  width: 280px;
  flex-shrink: 0;

  @media (max-width: 968px) {
    width: 100%;
  }
`;

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
`;

const PageHeader = styled.div`
  background: white;
  padding: 24px 28px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background-clip: text;
`;

const CustomerInfo = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  
  strong {
    color: #FF8F10;
    font-weight: 600;
  }
`;

// ==================== SIDEBAR NAVIGATION ====================

const SidebarNav = styled.nav`
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const NavItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${p => p.$active ? 'rgba(255, 143, 16, 0.08)' : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${p => p.$active ? '#FF8F10' : '#4a5568'};
  font-size: 0.95rem;
  font-weight: ${p => p.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  margin-bottom: 4px;

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${p => p.$active ? 'rgba(255, 143, 16, 0.12)' : 'rgba(0, 0, 0, 0.04)'};
    color: ${p => p.$active ? '#FF8F10' : '#1a1a1a'};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// ==================== CONTENT CARDS ====================

const ContentSection = styled.section`
  background: white;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const SectionBody = styled.div`
  padding: 0;
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const DataLabel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LabelText = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const DataValue = styled.span`
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardValue = styled.div`
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $verified?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${p => p.$verified ? '#dcfce7' : '#fef3c7'};
  color: ${p => p.$verified ? '#166534' : '#92400e'};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ActionButton = styled.button`
  padding: 8px 20px;
  background: white;
  color: #FF8F10;
  border: 2px solid #FF8F10;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: #FF8F10;
    color: white;
  }
  
  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

// ==================== PROFILE PHOTO CARD ====================

const ProfilePhotoCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 20px;

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
    : 'linear-gradient(135deg, #e8e8e8, #d0d0d0)'};
  background-size: cover;
  background-position: center;
  border: 3px solid #FF8F10;
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

const AvatarInfo = styled.div`
  flex: 1;
`;

const AvatarLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const AvatarNote = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

// ==================== ALERTS ====================

const AlertBox = styled.div<{ $type: 'warning' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: ${p => p.$type === 'warning' 
    ? 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)' 
    : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
  };
  border-left: 5px solid ${p => p.$type === 'warning' ? '#FF8F10' : '#005CA9'};
  border-radius: 8px;
  margin-top: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  
  svg {
    color: ${p => p.$type === 'warning' ? '#FF8F10' : '#005CA9'};
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  p {
    margin: 0;
    font-size: 0.95rem;
    color: #2c3e50;
    line-height: 1.6;
    
    a {
      color: ${p => p.$type === 'warning' ? '#FF8F10' : '#005CA9'};
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        text-decoration: underline;
        opacity: 0.8;
      }
    }
  }
`;

// ==================== COMPONENT ====================

const ProfileSettingsMobileDe: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { user } = useProfile();
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('login');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [connectedDevices] = useState(2);
  const [iotDevicesOnline] = useState(true);

  const customerNumber = currentUser?.uid ? currentUser.uid.substring(0, 8).toUpperCase() : '00000000';

  const getText = () => {
    if (language === 'bg') {
      return {
        pageTitle: 'Управление на профила',
        customerNumber: 'Вашият идентификационен номер:',
        profile: 'Профилна информация',
        profilePicture: 'Профилна снимка',
        onlyVisibleForYou: '(Само за вас)',
        loginData: 'Данни за влизане',
        email: 'Електронна поща',
        password: 'Парола за вход',
        contactData: 'Контактна информация',
        name: 'Пълно име',
        address: 'Местоположение',
        phoneNumber: 'Мобилен телефон',
        documents: 'Моите документи',
        myInvoices: 'Фактури и плащания',
        invoicesDesc: 'Тук можете да прегледате вашите пакети и абонаменти',
        confirmed: 'Потвърдено',
        notConfirmed: 'Неактивно',
        change: 'Редактирай',
        show: 'Преглед',
        activateFunctions: 'Разширете възможностите:',
        confirmPhoneNow: 'Активирайте телефона сега',
        noInvoices: 'Липсват фактури',
        notSet: 'Не е попълнено',
        iotDevices: 'Свързани IoT',
        connectedCars: 'Активни превозни средства',
        devicesOnline: 'активни устройства',
        manageDevices: 'Конфигурация'
      };
    } else {
      return {
        pageTitle: 'Profile Management',
        customerNumber: 'Your identification number:',
        profile: 'Profile Information',
        profilePicture: 'Profile Photo',
        onlyVisibleForYou: '(Private)',
        loginData: 'Login Credentials',
        email: 'Email Address',
        password: 'Access Password',
        contactData: 'Contact Information',
        name: 'Full Name',
        address: 'Location',
        phoneNumber: 'Mobile Phone',
        documents: 'My Documents',
        myInvoices: 'Billing & Invoices',
        invoicesDesc: 'View your subscription packages and payment history',
        confirmed: 'Verified',
        notConfirmed: 'Inactive',
        change: 'Edit',
        show: 'View',
        activateFunctions: 'Unlock more features:',
        confirmPhoneNow: 'Activate phone now',
        noInvoices: 'No invoices found',
        notSet: 'Not provided',
        iotDevices: 'Connected IoT',
        connectedCars: 'Active Vehicles',
        devicesOnline: 'devices active',
        manageDevices: 'Configure'
      };
    }
  };

  const text = getText();

  return (
    <PageContainer>
      {/* Customer Number Header */}
      <CustomerInfo>
        {text.customerNumber} <strong>#{customerNumber}</strong>
      </CustomerInfo>

      <ContentWrapper>
        {/* Sidebar Navigation */}
        <Sidebar>
          <SidebarNav>
            <NavItem 
              $active={activeSection === 'login'}
              onClick={() => setActiveSection('login')}
            >
              <Mail size={20} />
              {text.loginData}
            </NavItem>
            <NavItem 
              $active={activeSection === 'contact'}
              onClick={() => setActiveSection('contact')}
            >
              <Phone size={20} />
              {text.contactData}
            </NavItem>
            <NavItem 
              $active={activeSection === 'documents'}
              onClick={() => setActiveSection('documents')}
            >
              <FileText size={20} />
              {text.documents}
            </NavItem>
            <NavItem 
              $active={activeSection === 'iot'}
              onClick={() => setActiveSection('iot')}
            >
              <Wifi size={20} />
              {text.iotDevices}
            </NavItem>
          </SidebarNav>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          {/* Profile Photo Section */}
          <ContentSection>
            <SectionHeader>
              <SectionTitle>{text.profile}</SectionTitle>
            </SectionHeader>
            <SectionBody>
              <ProfilePhotoCard>
                <Avatar $imageUrl={user?.photoURL}>
                  {!user?.photoURL && <User size={40} />}
                </Avatar>
                <AvatarInfo>
                  <AvatarLabel>{text.profilePicture}</AvatarLabel>
                  <AvatarNote>{text.onlyVisibleForYou}</AvatarNote>
                </AvatarInfo>
                <ActionButton onClick={() => setShowPhotoModal(true)}>
                  <Camera size={18} />
                  {text.change}
                </ActionButton>
              </ProfilePhotoCard>
            </SectionBody>
          </ContentSection>

          {/* Login Data Section */}
          {activeSection === 'login' && (
            <ContentSection>
              <SectionHeader>
                <SectionTitle>{text.loginData}</SectionTitle>
              </SectionHeader>
              <SectionBody>
                {/* Email */}
                <DataRow>
                  <DataLabel>
                    <LabelText>{text.email}</LabelText>
                    <DataValue>
                      {user?.email || text.notSet}
                      {user?.verification?.email && (
                        <StatusBadge $verified>
                          <CheckCircle size={16} />
                          {text.confirmed}
                        </StatusBadge>
                      )}
                      {user?.email && !user?.verification?.email && (
                        <StatusBadge>
                          <AlertCircle size={16} />
                          {text.notConfirmed}
                        </StatusBadge>
                      )}
                    </DataValue>
                  </DataLabel>
                  <ActionButton onClick={() => setShowEmailModal(true)}>
                    {text.change}
                    <ChevronRight size={18} />
                  </ActionButton>
                </DataRow>

                {/* Password */}
                <DataRow>
                  <DataLabel>
                    <LabelText>{text.password}</LabelText>
                    <DataValue>••••••••••••</DataValue>
                  </DataLabel>
                  <ActionButton onClick={() => setShowPasswordModal(true)}>
                    {text.change}
                    <ChevronRight size={18} />
                  </ActionButton>
                </DataRow>
              </SectionBody>
            </ContentSection>
          )}

          {/* Contact Data Section */}
          {activeSection === 'contact' && (
            <ContentSection>
              <SectionHeader>
                <SectionTitle>{text.contactData}</SectionTitle>
              </SectionHeader>
              <SectionBody>
                {/* Name */}
                <DataRow>
                  <DataLabel>
                    <LabelText>{text.name}</LabelText>
                    <DataValue>
                      {user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || text.notSet}
                    </DataValue>
                  </DataLabel>
                  <ActionButton onClick={() => setShowNameModal(true)}>
                    {text.change}
                    <ChevronRight size={18} />
                  </ActionButton>
                </DataRow>

                {/* Phone Number */}
                <DataRow>
                  <DataLabel>
                    <LabelText>{text.phoneNumber}</LabelText>
                    <DataValue>
                      {user?.phoneNumber || text.notSet}
                      {user?.phoneNumber && (
                        user?.verification?.phone ? (
                          <StatusBadge $verified>
                            <CheckCircle size={16} />
                            {text.confirmed}
                          </StatusBadge>
                        ) : (
                          <StatusBadge>
                            <AlertCircle size={16} />
                            {text.notConfirmed}
                          </StatusBadge>
                        )
                      )}
                    </DataValue>
                  </DataLabel>
                  <ActionButton onClick={() => setShowPhoneModal(true)}>
                    {text.change}
                    <ChevronRight size={18} />
                  </ActionButton>
                </DataRow>

                {/* Address */}
                <DataRow>
                  <DataLabel>
                    <LabelText>{text.address}</LabelText>
                    <DataValue>{user?.location?.city || text.notSet}</DataValue>
                  </DataLabel>
                  <ActionButton>
                    {text.change}
                    <ChevronRight size={18} />
                  </ActionButton>
                </DataRow>

                {/* Phone Verification Alert */}
                {user?.phoneNumber && !user?.verification?.phone && (
                  <AlertBox $type="warning">
                    <AlertCircle size={22} />
                    <p>
                      {text.activateFunctions}{' '}
                      <a onClick={() => setShowPhoneModal(true)}>
                        {text.confirmPhoneNow}
                      </a>
                    </p>
                  </AlertBox>
                )}
              </SectionBody>
            </ContentSection>
          )}

          {/* Documents Section */}
          {activeSection === 'documents' && (
            <ContentSection>
              <SectionHeader>
                <SectionTitle>{text.documents}</SectionTitle>
              </SectionHeader>
              <SectionBody>
                <DataRow>
                  <DataLabel>
                    <LabelText>{text.myInvoices}</LabelText>
                    <DataValue style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                      {text.invoicesDesc}
                    </DataValue>
                  </DataLabel>
                  <ActionButton>
                    {text.show}
                    <ChevronRight size={18} />
                  </ActionButton>
                </DataRow>

                <AlertBox $type="info">
                  <Info size={22} />
                  <p>{text.noInvoices}</p>
                </AlertBox>
              </SectionBody>
            </ContentSection>
          )}

          {/* IoT Devices Section */}
          {activeSection === 'iot' && (
            <ContentSection>
              <SectionHeader>
                <SectionTitle>{text.iotDevices}</SectionTitle>
              </SectionHeader>
              <SectionBody>
                <DataRow>
                  <DataLabel>
                    <LabelText>{text.connectedCars}</LabelText>
                    <DataValue>
                      {connectedDevices} {text.devicesOnline}
                      {iotDevicesOnline ? (
                        <StatusBadge $verified>
                          <Wifi size={16} />
                          {language === 'bg' ? 'Активно' : 'Online'}
                        </StatusBadge>
                      ) : (
                        <StatusBadge>
                          <WifiOff size={16} />
                          {language === 'bg' ? 'Офлайн' : 'Offline'}
                        </StatusBadge>
                      )}
                    </DataValue>
                  </DataLabel>
                  <ActionButton onClick={() => window.open('/iot-dashboard', '_blank')}>
                    {text.manageDevices}
                    <ChevronRight size={18} />
                  </ActionButton>
                </DataRow>
              </SectionBody>
            </ContentSection>
          )}
        </MainContent>
      </ContentWrapper>

      {/* Modals */}
      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showPhoneModal && (
        <PhoneVerificationModal
          onClose={() => setShowPhoneModal(false)}
          phoneNumber={user?.phoneNumber}
        />
      )}

      {showEmailModal && (
        <EmailVerificationModal
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </PageContainer>
  );
};

export default ProfileSettingsMobileDe;

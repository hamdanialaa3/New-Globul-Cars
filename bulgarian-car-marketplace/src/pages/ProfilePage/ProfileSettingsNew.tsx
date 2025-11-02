// Profile Settings Page - Mobile.de Style
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Professional settings page with verification and account management
// ✨ Phase 5: UI Integration - NEW COMPONENTS INTEGRATED ✨

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import { 
  CustomerNumberBadge,
  LoginDataCard,
  ContactDataCard,
  DocumentsCard,
  DangerZoneCard,
  IDCardVerificationCard
} from '../../components/Profile/ProfileCards';
import ProfilePhotoCard from '../../components/Profile/ProfileCards/ProfilePhotoCard';
import PasswordChangeModal from '../../components/Profile/Modals/PasswordChangeModal';
import PhoneVerificationModal from '../../components/Profile/Modals/PhoneVerificationModal';
import EmailVerificationModal from '../../components/Profile/Modals/EmailVerificationModal';
import IDCardOverlay from '../../components/Profile/IDCardEditor/IDCardOverlay';
import { IDCardData } from '../../components/Profile/IDCardEditor/types';
import idVerificationService from '../../services/verification/id-verification.service';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import customerNumberService from '../../services/customer-number.service';

// ✨ NEW: Phase 5 Components
import { ProfileTypeSwitcher } from '../../components/Profile/ProfileTypeSwitcher';
import { DealershipProfileForm } from '../../components/Profile/Forms/DealershipProfileForm';
import { CompanyProfileForm } from '../../components/Profile/Forms/CompanyProfileForm';
import { VerificationUploader } from '../../components/Profile/VerificationUploader';
import { useCompleteProfile } from '../../hooks/useCompleteProfile';
import { isDealerProfile, isCompanyProfile } from '../../types/user/bulgarian-user.types';

const ProfileSettingsNew: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { user } = useProfile();
  const { profileType, theme } = useProfileType();
  const navigate = useNavigate();

  // ✨ NEW: Use complete profile hook for dealer/company data
  const { 
    user: completeUser, 
    dealership, 
    company,
    reload: reloadProfile 
  } = useCompleteProfile(currentUser?.uid);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showIDEditor, setShowIDEditor] = useState(false);
  const [idCardData, setIdCardData] = useState<Partial<IDCardData> | null>(null);
  
  // ✨ NEW: State for showing profile type-specific forms
  const [showDealerForm, setShowDealerForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleVerifyPhone = () => {
    setShowPhoneModal(true);
  };

  const handleVerifyEmail = () => {
    setShowEmailModal(true);
  };

  const handleEditIDCard = async () => {
    if (!currentUser) return;
    
    try {
      const data = await idVerificationService.getIDCardData(currentUser.uid);
      setIdCardData(data || {});
      setShowIDEditor(true);
    } catch (error) {
      console.error('Error loading ID data:', error);
      setIdCardData({});
      setShowIDEditor(true);
    }
  };

  const handleSaveIDCard = async (data: IDCardData) => {
    if (!currentUser) return;

    try {
      const result = await idVerificationService.saveIDCardData(currentUser.uid, data);
      
      if (result.success) {
        toast.success(language === 'bg'
          ? `Данните са запазени успешно! Trust Score: +${result.trustScoreGain}`
          : `Data saved successfully! Trust Score: +${result.trustScoreGain}`);
        setShowIDEditor(false);
      } else {
        toast.error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving ID data:', error);
      toast.error(language === 'bg'
        ? 'Грешка при запазване'
        : 'Error saving data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = language === 'bg'
      ? 'Сигурни ли сте? Напишете "DELETE" за потвърждение:'
      : 'Are you sure? Type "DELETE" to confirm:';
    
    const confirmation = prompt(confirmText);
    
    if (confirmation === 'DELETE') {
      try {
        if (currentUser) {
          await deleteUser(currentUser);
          toast.success(language === 'bg' 
            ? 'Акаунтът е изтрит успешно'
            : 'Account deleted successfully');
          navigate('/');
        }
      } catch (error) {
        toast.error(language === 'bg'
          ? 'Грешка при изтриване на акаунта'
          : 'Error deleting account');
      }
    }
  };

  const getRegistrationYear = () => {
    if ((user as any)?.customerNumber) {
      return customerNumberService.getRegistrationYear((user as any).customerNumber) || 2024;
    }
    return user?.createdAt ? new Date(user.createdAt).getFullYear() : 2024;
  };

  const getUserName = () => {
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.displayName || 'User';
  };

  const getUserAddress = () => {
    const address = (user as any)?.address;
    return {
      street: typeof address === 'object' ? address?.street : undefined,
      postalCode: typeof address === 'object' ? address?.postalCode : undefined,
      city: user?.location?.city || (typeof address === 'object' ? address?.city : undefined)
    };
  };

  if (!currentUser || !user) {
    return (
      <Container>
        <LoadingMessage>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>
        {language === 'bg' ? 'Настройки на акаунта' : 'Your account settings'}
      </PageTitle>

      <CustomerNumberBadge userId={currentUser.uid} />

      {/* ✨ NEW: Profile Type Switcher */}
      <SectionSpacer />
      <ProfileTypeSwitcher 
        currentUid={currentUser.uid}
        onSwitchComplete={() => {
          reloadProfile();
          toast.success(language === 'bg' 
            ? 'Типът на профила е променен успешно!' 
            : 'Profile type changed successfully!');
        }}
      />

      <SectionSpacer />
      <ProfilePhotoCard 
        userId={currentUser.uid}
        currentPhotoUrl={user?.profileImage?.url}
      />

      <IDCardVerificationCard
        isVerified={(user as any)?.verification?.idVerified || false}
        trustScore={(user as any)?.verification?.trustScore}
        onEdit={handleEditIDCard}
      />

      <LoginDataCard
        email={currentUser.email || ''}
        emailVerified={currentUser.emailVerified}
        onChangePassword={handleChangePassword}
        onVerifyEmail={!currentUser.emailVerified ? handleVerifyEmail : undefined}
      />

      <ContactDataCard
        name={getUserName()}
        address={getUserAddress()}
        phoneNumber={user?.phoneNumber}
        phoneVerified={(user as any)?.phoneVerified || false}
        onVerifyPhone={!(user as any)?.phoneVerified ? handleVerifyPhone : undefined}
      />

      {/* ✨ NEW: Dealership Profile Form (for dealers only) */}
      {completeUser && isDealerProfile(completeUser) && (
        <>
          <SectionSpacer />
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                {language === 'bg' ? '🏢 Информация за автокъща' : '🏢 Dealership Information'}
              </SectionTitle>
              <ToggleButton onClick={() => setShowDealerForm(!showDealerForm)}>
                {showDealerForm 
                  ? (language === 'bg' ? 'Скрий' : 'Hide')
                  : (language === 'bg' ? 'Покажи' : 'Show')}
              </ToggleButton>
            </SectionHeader>
            
            {showDealerForm && (
              <DealershipProfileForm
                uid={currentUser.uid}
                initialData={dealership}
                themeColor={theme.primaryColor}
                onSave={(data) => {
                  toast.success(language === 'bg' 
                    ? 'Информацията е запазена!' 
                    : 'Information saved!');
                  reloadProfile();
                  setShowDealerForm(false);
                }}
                onCancel={() => setShowDealerForm(false)}
              />
            )}
          </SectionCard>
        </>
      )}

      {/* ✨ NEW: Company Profile Form (for companies only) */}
      {completeUser && isCompanyProfile(completeUser) && (
        <>
          <SectionSpacer />
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                {language === 'bg' ? '🏛️ Информация за фирма' : '🏛️ Company Information'}
              </SectionTitle>
              <ToggleButton onClick={() => setShowCompanyForm(!showCompanyForm)}>
                {showCompanyForm 
                  ? (language === 'bg' ? 'Скрий' : 'Hide')
                  : (language === 'bg' ? 'Покажи' : 'Show')}
              </ToggleButton>
            </SectionHeader>
            
            {showCompanyForm && (
              <CompanyProfileForm
                uid={currentUser.uid}
                initialData={company}
                themeColor={theme.primaryColor}
                onSave={(data) => {
                  toast.success(language === 'bg' 
                    ? 'Информацията е запазена!' 
                    : 'Information saved!');
                  reloadProfile();
                  setShowCompanyForm(false);
                }}
                onCancel={() => setShowCompanyForm(false)}
              />
            )}
          </SectionCard>
        </>
      )}

      {/* ✨ NEW: Verification Document Uploader */}
      <SectionSpacer />
      <SectionCard>
        <SectionHeader>
          <SectionTitle>
            {language === 'bg' ? '📄 Документи за верификация' : '📄 Verification Documents'}
          </SectionTitle>
        </SectionHeader>
        <VerificationUploader
          uid={currentUser.uid}
          profileType={profileType}
          onUploadComplete={() => {
            toast.success(language === 'bg' 
              ? 'Документът е качен успешно!' 
              : 'Document uploaded successfully!');
            reloadProfile();
          }}
        />
      </SectionCard>

      <DocumentsCard invoices={(user as any)?.invoices || []} />

      <DangerZoneCard
        email={currentUser.email || ''}
        registeredYear={getRegistrationYear()}
        accountType={user?.accountType || 'private'}
        onDeleteAccount={handleDeleteAccount}
      />

      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showPhoneModal && (
        <PhoneVerificationModal 
          phoneNumber={user?.phoneNumber}
          onClose={() => setShowPhoneModal(false)} 
        />
      )}

      {showEmailModal && (
        <EmailVerificationModal onClose={() => setShowEmailModal(false)} />
      )}

      {showIDEditor && (
        <IDCardOverlay
          initialData={idCardData || {}}
          onSave={handleSaveIDCard}
          onClose={() => setShowIDEditor(false)}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 32px 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 1.125rem;
  color: #6c757d;
`;

// ✨ NEW: Styled components for Phase 5 integration
const SectionSpacer = styled.div`
  height: 32px;
`;

const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
`;

const ToggleButton = styled.button`
  background: #FF7900;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e66d00;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default ProfileSettingsNew;


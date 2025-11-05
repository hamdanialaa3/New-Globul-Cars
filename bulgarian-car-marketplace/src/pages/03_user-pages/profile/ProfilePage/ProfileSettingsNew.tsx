// Profile Settings Page - Mobile.de Style
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Professional settings page with verification and account management

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useAuth } from '../../../../../contexts/AuthProvider';
import { useProfile } from './hooks/useProfile';
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
import idVerificationService from '../../../../../services/verification/id-verification.service';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import customerNumberService from '../../../../../services/customer-number.service';

const ProfileSettingsNew: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { user } = useProfile();
  const navigate = useNavigate();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showIDEditor, setShowIDEditor] = useState(false);
  const [idCardData, setIdCardData] = useState<Partial<IDCardData> | null>(null);

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

export default ProfileSettingsNew;


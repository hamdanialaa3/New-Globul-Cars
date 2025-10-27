import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { CreditCard, Edit, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import PrivacySettingsManager from '../../components/Profile/Privacy/PrivacySettingsManager';
import DealershipInfoForm from '../../components/Profile/Dealership/DealershipInfoForm';
import SocialMediaSettings from '../../components/Profile/SocialMedia/SocialMediaSettings';
import IDCardOverlay from '../../components/Profile/IDCardEditor/IDCardOverlay';
import BusinessInformationForm from '../../components/Profile/BusinessInfo/BusinessInformationForm';
import { IDCardData } from '../../components/Profile/IDCardEditor/types';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import idVerificationService from '../../services/verification/id-verification.service';
import * as S from './styles';

/**
 * Settings Tab - Privacy, Dealership info, Social media, ID Card
 */
const ProfileSettings: React.FC = () => {
  const { language } = useLanguage();
  const { user, profileData } = useProfile();
  const { profileType, isDealer, isCompany } = useProfileType();
  const [showIDEditor, setShowIDEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialIDData, setInitialIDData] = useState<Partial<IDCardData> | null>(null);
  const [loadingIDData, setLoadingIDData] = useState(false);

  // Load existing ID data when opening editor
  useEffect(() => {
    if (showIDEditor && user?.uid) {
      loadIDData();
    }
  }, [showIDEditor, user?.uid]);

  // Load ID card data from Firestore
  const loadIDData = async () => {
    if (!user?.uid) return;
    
    setLoadingIDData(true);
    try {
      const data = await idVerificationService.getIDCardData(user.uid);
      if (data) {
        setInitialIDData(data);
      } else {
        // Use profile data as fallback
        setInitialIDData({
          firstNameEN: (user as any)?.firstName,
          middleNameEN: (user as any)?.middleName,
          lastNameEN: (user as any)?.lastName,
          firstNameBG: (user as any)?.firstNameBG,
          middleNameBG: (user as any)?.middleNameBG,
          lastNameBG: (user as any)?.lastNameBG,
          dateOfBirth: (user as any)?.dateOfBirth,
          sex: (user as any)?.sex,
          height: (user as any)?.height,
          personalNumber: (user as any)?.idCard?.personalNumber
        });
      }
    } catch (error) {
      console.error('Error loading ID data:', error);
    } finally {
      setLoadingIDData(false);
    }
  };

  // Handle ID card save with validation
  const handleIDCardSave = async (data: IDCardData) => {
    if (!user?.uid) {
      setSaveError(language === 'bg' 
        ? 'Не сте влезли в системата' 
        : 'User not authenticated');
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // Use the verification service
      const result = await idVerificationService.saveIDCardData(user.uid, data);
      
      if (result.success) {
        setSaveSuccess(true);
        setShowIDEditor(false);
        
        // Show success message with trust score gain
        const message = language === 'bg'
          ? `✅ Данните са запазени успешно!\n🎉 Trust Score: +${result.trustScoreGain} точки`
          : `✅ Data saved successfully!\n🎉 Trust Score: +${result.trustScoreGain} points`;
        
        alert(message);
        
        // Reset success state after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
        
      } else {
        setSaveError(result.error || 'Unknown error');
        alert(language === 'bg'
          ? `❌ Грешка: ${result.error}`
          : `❌ Error: ${result.error}`);
      }
        
    } catch (error) {
      console.error('Error saving ID data:', error);
      const errorMsg = (error as Error).message;
      setSaveError(errorMsg);
      alert(language === 'bg'
        ? `❌ Грешка при запазване: ${errorMsg}`
        : `❌ Error saving data: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#333' }}>
        {language === 'bg' ? 'Настройки' : 'Settings'}
      </h2>
      
      {/* ⚡ NEW: ID Card Editor Section */}
      <IDCardSection>
        <SectionHeader>
          <SectionTitle>
            <CreditCard size={20} />
            {language === 'bg' ? 'Лична карта' : 'ID Card'}
          </SectionTitle>
          <EditIDButton 
            onClick={() => setShowIDEditor(true)}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader size={16} className="spin" />
                {language === 'bg' ? 'Запазване...' : 'Saving...'}
              </>
            ) : (
              <>
                <Edit size={16} />
                {language === 'bg' ? 'Редактирай с лична карта' : 'Edit with ID Card'}
              </>
            )}
          </EditIDButton>
        </SectionHeader>
        
        <IDCardDescription>
          {language === 'bg'
            ? 'Попълнете данните си директно върху изображение на личната ви карта. Системата автоматично ще извлече информация от ЕГН.'
            : 'Fill your data directly over your ID card image. System will automatically extract information from your personal number (EGN).'}
        </IDCardDescription>
        
        {/* Status Messages */}
        {saveSuccess && (
          <StatusMessage type="success">
            <CheckCircle size={18} />
            {language === 'bg' 
              ? 'Данните са запазени успешно!' 
              : 'Data saved successfully!'}
          </StatusMessage>
        )}
        
        {saveError && (
          <StatusMessage type="error">
            <AlertCircle size={18} />
            {saveError}
          </StatusMessage>
        )}
        
        {/* Verification Badge */}
        {(user as any)?.verification?.idVerified && (
          <VerifiedBadge>
            <CheckCircle size={16} />
            {language === 'bg' ? 'Потвърдено' : 'Verified'}
            {(user as any)?.verification?.trustScore && (
              <TrustScore>
                Trust Score: {(user as any).verification.trustScore}/100
              </TrustScore>
            )}
          </VerifiedBadge>
        )}
      </IDCardSection>
      
      {/* Privacy Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
          {language === 'bg' ? 'Поверителност' : 'Privacy'}
        </h3>
        <PrivacySettingsManager />
      </div>
      
      {/* ⚡ NEW: Business Information (for Dealer & Company) */}
      {(isDealer || isCompany) && (
        <div style={{ marginBottom: '2rem' }}>
          <BusinessInformationForm userId={user?.uid || ''} />
        </div>
      )}
      
      {/* Dealership Info (if dealer/company) */}
      {(profileData?.accountType === 'dealer' || profileData?.accountType === 'company') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
            {language === 'bg' ? 'Информация за автокъща' : 'Dealership Information'}
          </h3>
          <DealershipInfoForm userId={user?.uid || ''} />
        </div>
      )}
      
      {/* Social Media Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
          {language === 'bg' ? 'Социални мрежи' : 'Social Media'}
        </h3>
        <SocialMediaSettings />
      </div>
      
      {/* ID Card Editor Modal */}
      {showIDEditor && (
        <>
          {loadingIDData ? (
            <LoadingOverlay>
              <Loader size={40} className="spin" />
              <p>{language === 'bg' ? 'Зареждане на данни...' : 'Loading data...'}</p>
            </LoadingOverlay>
          ) : (
            <IDCardOverlay
              initialData={initialIDData || {}}
              onSave={handleIDCardSave}
              onClose={() => {
                setShowIDEditor(false);
                setSaveError(null);
                setSaveSuccess(false);
              }}
            />
          )}
        </>
      )}
    </S.ContentSection>
  );
};

// Styled Components
const IDCardSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 24px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
  }
`;

const EditIDButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  
  padding: 10px 20px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 10px;
  
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    flex-shrink: 0;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 0.875rem;
  }
`;

const IDCardDescription = styled.p`
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

const VerifiedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  
  padding: 10px 16px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  border-radius: 20px;
  
  font-size: 0.875rem;
  font-weight: 600;
  
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
  
  svg {
    flex-shrink: 0;
  }
`;

const TrustScore = styled.span`
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 10px;
  
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' 
    : 'linear-gradient(135deg, #fee2e2, #fecaca)'};
  
  color: ${props => props.type === 'success' ? '#065f46' : '#991b1b'};
  
  font-size: 0.9rem;
  font-weight: 600;
  
  border: 2px solid ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
  
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  z-index: 10001; /* Above IDCardOverlay */
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  p {
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

export default ProfileSettings;


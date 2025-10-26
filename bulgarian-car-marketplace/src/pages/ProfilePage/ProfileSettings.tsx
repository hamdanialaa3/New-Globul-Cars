import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { CreditCard, Edit } from 'lucide-react';
import PrivacySettingsManager from '../../components/Profile/Privacy/PrivacySettingsManager';
import DealershipInfoForm from '../../components/Profile/Dealership/DealershipInfoForm';
import SocialMediaSettings from '../../components/Profile/SocialMedia/SocialMediaSettings';
import IDCardOverlay from '../../components/Profile/IDCardEditor/IDCardOverlay';
import { IDCardData } from '../../components/Profile/IDCardEditor/types';
import { useProfile } from './hooks/useProfile';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import * as S from './styles';

/**
 * Settings Tab - Privacy, Dealership info, Social media, ID Card
 */
const ProfileSettings: React.FC = () => {
  const { language } = useLanguage();
  const { user, profileData } = useProfile();
  const [showIDEditor, setShowIDEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle ID card save
  const handleIDCardSave = async (data: IDCardData) => {
    if (!user?.uid) return;
    
    setSaving(true);
    
    try {
      // Update user profile with ID data
      await updateDoc(doc(db, 'users', user.uid), {
        // Names
        firstName: data.firstNameEN,
        middleName: data.middleNameEN,
        lastName: data.lastNameEN,
        firstNameBG: data.firstNameBG,
        middleNameBG: data.middleNameBG,
        lastNameBG: data.lastNameBG,
        
        // Personal details
        dateOfBirth: data.dateOfBirth,
        sex: data.sex,
        height: data.height,
        eyeColor: data.eyeColor,
        placeOfBirth: data.placeOfBirth,
        
        // Document info (encrypted in real system!)
        idCard: {
          documentNumber: data.documentNumber,
          personalNumber: data.personalNumber,  // EGN
          expiryDate: data.expiryDate,
          issueDate: data.issueDate,
          issuingAuthority: data.issuingAuthority
        },
        
        // Address
        address: `${data.addressStreet}, ${data.addressMunicipality}`,
        addressOblast: data.addressOblast,
        
        // Verification
        'verification.idVerified': true,
        'verification.idVerifiedAt': new Date(),
        'verification.trustScore': (user as any).verification?.trustScore + 50 || 50,
        
        updatedAt: new Date()
      });
      
      setShowIDEditor(false);
      alert(language === 'bg'
        ? '✅ Данните от личната карта са запазени успешно!'
        : '✅ ID card data saved successfully!');
        
    } catch (error) {
      console.error('Error saving ID data:', error);
      alert(language === 'bg'
        ? '❌ Грешка при запазване на данните'
        : '❌ Error saving data');
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
          <EditIDButton onClick={() => setShowIDEditor(true)}>
            <Edit size={16} />
            {language === 'bg' ? 'Редактирай с лична карта' : 'Edit with ID Card'}
          </EditIDButton>
        </SectionHeader>
        
        <IDCardDescription>
          {language === 'bg'
            ? 'Попълнете данните си директно върху изображение на личната ви карта. Системата автоматично ще извлече информация от ЕГН.'
            : 'Fill your data directly over your ID card image. System will automatically extract information from your personal number (EGN).'}
        </IDCardDescription>
        
        {(user as any)?.verification?.idVerified && (
          <VerifiedBadge>
            ✓ {language === 'bg' ? 'Потвърдено' : 'Verified'}
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
      
      {/* Dealership Info (if dealer/company) */}
      {(profileData?.accountType === 'dealer' || profileData?.accountType === 'company') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
            {language === 'bg' ? 'Информация за бизнеса' : 'Business Information'}
          </h3>
          <DealershipInfoForm />
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
        <IDCardOverlay
          initialData={{
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
          }}
          onSave={handleIDCardSave}
          onClose={() => setShowIDEditor(false)}
        />
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  svg {
    flex-shrink: 0;
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
  gap: 6px;
  
  padding: 8px 16px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  border-radius: 20px;
  
  font-size: 0.875rem;
  font-weight: 600;
  
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
`;

export default ProfileSettings;


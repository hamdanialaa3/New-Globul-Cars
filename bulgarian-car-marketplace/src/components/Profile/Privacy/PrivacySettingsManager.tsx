import { logger } from '../../../services/logger-service';
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff, Shield, Lock, Unlock, Save } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { profileService } from '../../../services/profile/UnifiedProfileService';
import { DEFAULT_PRIVACY_SETTINGS } from '../../../types/dealership/dealership.types';
import type { PrivacySettings } from '../../../types/dealership/dealership.types';
import { useToast } from '../../Toast';

interface PrivacySettingsManagerProps {
  userId: string;
  accountType?: 'individual' | 'dealership';
}

const PrivacySettingsManager: React.FC<PrivacySettingsManagerProps> = ({ 
  userId, 
  accountType = 'individual'
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const privacySettings = await profileService.getPrivacySettings(userId);
      if (privacySettings) {
        setSettings(privacySettings);
      }
    } catch (error) {
      logger.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVisibilityChange = (visibility: PrivacySettings['profileVisibility']) => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: visibility
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await profileService.savePrivacySettings(userId, settings);
      showToast(
        'success',
        language === 'bg' ? 'Настройките са запазени' : 'Settings saved successfully'
      );
    } catch (error) {
      logger.error('Error saving privacy settings:', error);
      showToast(
        'error',
        language === 'bg' ? 'Грешка при запазване' : 'Error saving settings'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</p>
      </LoadingContainer>
    );
  }

  const translations = {
    bg: {
      title: 'Настройки за поверителност',
      subtitle: 'Контролирайте какво други могат да видят в профила ви',
      profileVisibility: 'Видимост на профила',
      public: 'Публичен',
      registeredOnly: 'Само за регистрирани',
      private: 'Личен',
      personalInfo: 'Лична информация',
      showFullName: 'Покажи пълно име',
      showEmail: 'Покажи имейл',
      showPhone: 'Покажи телефон',
      showAddress: 'Покажи адрес',
      showDateOfBirth: 'Покажи дата на раждане',
      showPlaceOfBirth: 'Покажи място на раждане',
      dealershipInfo: 'Информация за автокъща',
      showDealershipName: 'Покажи име на автокъща',
      showLegalForm: 'Покажи правна форма',
      showVATNumber: 'Покажи ДДС номер',
      showCompanyRegNumber: 'Покажи ЕИК',
      showDealershipAddress: 'Покажи адрес на автокъща',
      showWorkingHours: 'Покажи работно време',
      showWebsite: 'Покажи уебсайт',
      showSocialMedia: 'Покажи социални мрежи',
      showManager: 'Покажи информация за мениджър',
      showServices: 'Покажи услуги',
      showCertifications: 'Покажи сертификати',
      showGallery: 'Покажи галерия',
      statistics: 'Статистика',
      showTotalCars: 'Покажи брой автомобили',
      showTrustScore: 'Покажи рейтинг на доверие',
      showReviews: 'Покажи отзиви',
      saveButton: 'Запази настройки'
    },
    en: {
      title: 'Privacy Settings',
      subtitle: 'Control what others can see in your profile',
      profileVisibility: 'Profile Visibility',
      public: 'Public',
      registeredOnly: 'Registered Users Only',
      private: 'Private',
      personalInfo: 'Personal Information',
      showFullName: 'Show full name',
      showEmail: 'Show email',
      showPhone: 'Show phone',
      showAddress: 'Show address',
      showDateOfBirth: 'Show date of birth',
      showPlaceOfBirth: 'Show place of birth',
      dealershipInfo: 'Dealership Information',
      showDealershipName: 'Show dealership name',
      showLegalForm: 'Show legal form',
      showVATNumber: 'Show VAT number',
      showCompanyRegNumber: 'Show company registration number',
      showDealershipAddress: 'Show dealership address',
      showWorkingHours: 'Show working hours',
      showWebsite: 'Show website',
      showSocialMedia: 'Show social media',
      showManager: 'Show manager information',
      showServices: 'Show services',
      showCertifications: 'Show certifications',
      showGallery: 'Show gallery',
      statistics: 'Statistics',
      showTotalCars: 'Show total cars',
      showTrustScore: 'Show trust score',
      showReviews: 'Show reviews',
      saveButton: 'Save Settings'
    }
  };

  const t = translations[language as 'bg' | 'en'];

  return (
    <Container>
      <Header>
        <Shield size={24} />
        <div>
          <Title>{t.title}</Title>
          <Subtitle>{t.subtitle}</Subtitle>
        </div>
      </Header>

      {/* Profile Visibility */}
      <Section>
        <SectionTitle>{t.profileVisibility}</SectionTitle>
        <VisibilityOptions>
          <VisibilityOption
            $active={settings.profileVisibility === 'public'}
            onClick={() => handleVisibilityChange('public')}
          >
            <Unlock size={20} />
            <span>{t.public}</span>
          </VisibilityOption>
          <VisibilityOption
            $active={settings.profileVisibility === 'registered_only'}
            onClick={() => handleVisibilityChange('registered_only')}
          >
            <Eye size={20} />
            <span>{t.registeredOnly}</span>
          </VisibilityOption>
          <VisibilityOption
            $active={settings.profileVisibility === 'private'}
            onClick={() => handleVisibilityChange('private')}
          >
            <Lock size={20} />
            <span>{t.private}</span>
          </VisibilityOption>
        </VisibilityOptions>
      </Section>

      {/* Personal Information */}
      <Section>
        <SectionTitle>{t.personalInfo}</SectionTitle>
        <SettingsList>
          <SettingItem>
            <SettingLabel>{t.showFullName}</SettingLabel>
            <ToggleSwitch
              $active={settings.showFullName}
              onClick={() => handleToggle('showFullName')}
            >
              {settings.showFullName ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t.showEmail}</SettingLabel>
            <ToggleSwitch
              $active={settings.showEmail}
              onClick={() => handleToggle('showEmail')}
            >
              {settings.showEmail ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t.showPhone}</SettingLabel>
            <ToggleSwitch
              $active={settings.showPhone}
              onClick={() => handleToggle('showPhone')}
            >
              {settings.showPhone ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t.showAddress}</SettingLabel>
            <ToggleSwitch
              $active={settings.showAddress}
              onClick={() => handleToggle('showAddress')}
            >
              {settings.showAddress ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t.showDateOfBirth}</SettingLabel>
            <ToggleSwitch
              $active={settings.showDateOfBirth}
              onClick={() => handleToggle('showDateOfBirth')}
            >
              {settings.showDateOfBirth ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t.showPlaceOfBirth}</SettingLabel>
            <ToggleSwitch
              $active={settings.showPlaceOfBirth}
              onClick={() => handleToggle('showPlaceOfBirth')}
            >
              {settings.showPlaceOfBirth ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
        </SettingsList>
      </Section>

      {/* Dealership Information (only for dealerships) */}
      {accountType === 'dealership' && (
        <Section>
          <SectionTitle>{t.dealershipInfo}</SectionTitle>
          <SettingsList>
            <SettingItem>
              <SettingLabel>{t.showDealershipName}</SettingLabel>
              <ToggleSwitch
                $active={settings.showDealershipName}
                onClick={() => handleToggle('showDealershipName')}
              >
                {settings.showDealershipName ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showLegalForm}</SettingLabel>
              <ToggleSwitch
                $active={settings.showLegalForm}
                onClick={() => handleToggle('showLegalForm')}
              >
                {settings.showLegalForm ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showVATNumber}</SettingLabel>
              <ToggleSwitch
                $active={settings.showVATNumber}
                onClick={() => handleToggle('showVATNumber')}
              >
                {settings.showVATNumber ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showCompanyRegNumber}</SettingLabel>
              <ToggleSwitch
                $active={settings.showCompanyRegNumber}
                onClick={() => handleToggle('showCompanyRegNumber')}
              >
                {settings.showCompanyRegNumber ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showDealershipAddress}</SettingLabel>
              <ToggleSwitch
                $active={settings.showDealershipAddress}
                onClick={() => handleToggle('showDealershipAddress')}
              >
                {settings.showDealershipAddress ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showWorkingHours}</SettingLabel>
              <ToggleSwitch
                $active={settings.showWorkingHours}
                onClick={() => handleToggle('showWorkingHours')}
              >
                {settings.showWorkingHours ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showWebsite}</SettingLabel>
              <ToggleSwitch
                $active={settings.showWebsite}
                onClick={() => handleToggle('showWebsite')}
              >
                {settings.showWebsite ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showSocialMedia}</SettingLabel>
              <ToggleSwitch
                $active={settings.showSocialMedia}
                onClick={() => handleToggle('showSocialMedia')}
              >
                {settings.showSocialMedia ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showManager}</SettingLabel>
              <ToggleSwitch
                $active={settings.showManager}
                onClick={() => handleToggle('showManager')}
              >
                {settings.showManager ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showServices}</SettingLabel>
              <ToggleSwitch
                $active={settings.showServices}
                onClick={() => handleToggle('showServices')}
              >
                {settings.showServices ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showCertifications}</SettingLabel>
              <ToggleSwitch
                $active={settings.showCertifications}
                onClick={() => handleToggle('showCertifications')}
              >
                {settings.showCertifications ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t.showGallery}</SettingLabel>
              <ToggleSwitch
                $active={settings.showGallery}
                onClick={() => handleToggle('showGallery')}
              >
                {settings.showGallery ? <Eye size={18} /> : <EyeOff size={18} />}
              </ToggleSwitch>
            </SettingItem>
          </SettingsList>
        </Section>
      )}

      {/* Statistics */}
      <Section>
        <SectionTitle>{t.statistics}</SectionTitle>
        <SettingsList>
          <SettingItem>
            <SettingLabel>{t.showTotalCars}</SettingLabel>
            <ToggleSwitch
              $active={settings.showTotalCars}
              onClick={() => handleToggle('showTotalCars')}
            >
              {settings.showTotalCars ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t.showTrustScore}</SettingLabel>
            <ToggleSwitch
              $active={settings.showTrustScore}
              onClick={() => handleToggle('showTrustScore')}
            >
              {settings.showTrustScore ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>{t.showReviews}</SettingLabel>
            <ToggleSwitch
              $active={settings.showReviews}
              onClick={() => handleToggle('showReviews')}
            >
              {settings.showReviews ? <Eye size={18} /> : <EyeOff size={18} />}
            </ToggleSwitch>
          </SettingItem>
        </SettingsList>
      </Section>

      {/* Save Button */}
      <SaveButton onClick={handleSave} disabled={saving}>
        <Save size={20} />
        {saving ? (language === 'bg' ? 'Запазване...' : 'Saving...') : t.saveButton}
      </SaveButton>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  
  svg {
    color: #FF8F10;
    flex-shrink: 0;
  }
`;

const Title = styled.h2`
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #FF8F10;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6c757d;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const VisibilityOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const VisibilityOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${props => props.$active ? '#FF8F10' : '#e0e0e0'};
  border-radius: 12px;
  background: ${props => props.$active ? 'rgba(255, 143, 16, 0.1)' : '#fff'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    color: ${props => props.$active ? '#FF8F10' : '#6c757d'};
  }
  
  span {
    font-weight: ${props => props.$active ? '600' : '400'};
    color: ${props => props.$active ? '#FF8F10' : '#333'};
  }
  
  &:hover {
    border-color: #FF8F10;
    background: rgba(255, 143, 16, 0.05);
  }
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
`;

const SettingLabel = styled.span`
  font-size: 14px;
  color: #333;
`;

const ToggleSwitch = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 28px;
  background: ${props => props.$active ? '#FF8F10' : '#ccc'};
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  svg {
    color: white;
    position: absolute;
    left: ${props => props.$active ? '22px' : '4px'};
    transition: left 0.3s ease;
  }
  
  &:hover {
    opacity: 0.8;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #FF8F10, #FF6B35);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  
  p {
    margin-top: 16px;
    color: #6c757d;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FF8F10;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default PrivacySettingsManager;

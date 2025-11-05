// ProfileSettings.tsx - mobile.de Inspired Settings Page
// ⚡ OPTIMIZED: Compact & Professional Design
// Only for Private seller type

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../../../contexts/AuthProvider';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useProfileType } from '../../../../../contexts/ProfileTypeContext'; // ⚡ FIX: Use ProfileType Context
import SettingsSidebar from './SettingsSidebar'; // ⚡ NEW: Sidebar
import { 
  Settings, Shield, Eye, EyeOff, Save, Mail, Phone, 
  MapPin, Calendar, User as UserIcon, BarChart3, Star,
  MessageSquare, Lock, Unlock, Facebook, Twitter, Linkedin,
  Youtube, Link as LinkIcon, Unlink, CheckCircle, AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useProfile } from './hooks/useProfile';
import { dealershipService } from '../../../../../services/dealership/dealership.service';
import { DEFAULT_PRIVACY_SETTINGS } from '../../types/dealership.types';
import type { PrivacySettings } from '../../types/dealership.types';
import { useToast } from '../../components/Toast';
import socialMediaService from '../../../../../services/social/social-media.service';
import { PLATFORM_CONFIGS, SocialMediaAccount, SocialPlatform } from '../../types/social-media.types';

// TikTok Icon (custom SVG)
const TikTokIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { profileType, isPrivate } = useProfileType(); // ⚡ FIX: Use ProfileType Context
  const { showToast } = useToast();

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [saving, setSaving] = useState(false);

  // Social Media State
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([]);
  const [connecting, setConnecting] = useState<SocialPlatform | null>(null);

  // ⚡ Load settings function (defined before useEffect)
  const loadSettings = async () => {
    if (!user?.uid) return;
    
    try {
      // Load privacy settings
      const privacy = await dealershipService.getPrivacySettings(user.uid);
      if (privacy) {
        setPrivacySettings(privacy);
      }

      // Load social media accounts
      const accounts = await socialMediaService.getConnectedAccounts(user.uid);
      setSocialAccounts(accounts);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // ⚡ FIX: Load settings on mount (before early return)
  useEffect(() => {
    if (user?.uid && isPrivate) {
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, isPrivate]);

  // ⚡ FIX: Only show for Private seller type (after all hooks)
  if (!isPrivate) {
    const profileTypeText = profileType === 'dealer' 
      ? (language === 'bg' ? 'Дилър' : 'Dealer')
      : (language === 'bg' ? 'Компания' : 'Company');

    return (
      <Container>
        <MessageBox>
          <Shield size={48} color="#FF8F10" style={{ marginBottom: '16px' }} />
          <h3>
            {language === 'bg' 
              ? 'Настройки за личен профил' 
              : 'Private Account Settings'}
          </h3>
          <p>
            {language === 'bg' 
              ? `Тази страница е достъпна само за лични акаунти. Вашият текущ тип акаунт: ${profileTypeText}` 
              : `This page is only available for private accounts. Your current account type: ${profileTypeText}`}
          </p>
          <p style={{ marginTop: '12px', fontSize: '0.875rem', color: '#999' }}>
            {language === 'bg' 
              ? 'За да промените типа акаунт, натиснете бутона "Type" в горната част' 
              : 'To change account type, click the "Type" button in the header'}
          </p>
        </MessageBox>
      </Container>
    );
  }

  const handlePrivacyToggle = (key: keyof PrivacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVisibilityChange = (visibility: PrivacySettings['profileVisibility']) => {
    setPrivacySettings(prev => ({
      ...prev,
      profileVisibility: visibility
    }));
  };

  const handleSavePrivacy = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      await dealershipService.savePrivacySettings(user.uid, privacySettings);
      showToast(
        'success',
        language === 'bg' ? 'Настройките са запазени' : 'Settings saved successfully'
      );
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      showToast(
        'error',
        language === 'bg' ? 'Грешка при запазване' : 'Error saving settings'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConnectSocial = async (platform: SocialPlatform) => {
    if (!user?.uid) return;

    try {
      setConnecting(platform);
      await socialMediaService.initiateOAuth(platform, user.uid);
    } catch (error) {
      console.error('Error connecting:', error);
      showToast('error', language === 'bg' ? 'Грешка при свързване' : 'Connection failed');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnectSocial = async (platform: SocialPlatform) => {
    if (!user?.uid) return;
    
    if (!window.confirm(language === 'bg' 
      ? 'Сигурни ли сте?' 
      : 'Are you sure?')) {
      return;
    }

    try {
      await socialMediaService.disconnectAccount(user.uid, platform);
      await loadSettings();
      showToast('success', language === 'bg' ? 'Изключено' : 'Disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const getSocialIcon = (platform: SocialPlatform) => {
    const iconProps = { size: 16, color: 'white' };
    switch (platform) {
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      // eslint-disable-next-line react/jsx-no-undef
      case 'tiktok': return <TikTokIcon {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'youtube': return <Youtube {...iconProps} />;
    }
  };

  const isConnected = (platform: SocialPlatform) => {
    return socialAccounts.some(acc => acc.platform === platform && acc.isActive);
  };

  const t = {
    bg: {
      settings: 'Настройки на акаунта',
      customerNumber: 'Вашият клиентски номер',
      loginData: 'Данни за вход',
      email: 'Имейл адрес',
      confirmed: 'Потвърден',
      notConfirmed: 'Не е потвърден',
      password: 'Парола',
      change: 'Промени',
      contactData: 'Данни за контакт',
      name: 'Име',
      address: 'Адрес',
      phoneNumber: 'Телефонен номер',
      activateFunctions: 'Активирайте допълнителни функции',
      confirmPhone: 'Потвърдете телефонния номер сега',
      documents: 'Документи',
      myInvoices: 'Моите фактури',
      invoicesDesc: 'Тук ще намерите преглед на вашите резервирани пакети и опции',
      noInvoices: 'Няма налични фактури',
      show: 'Покажи',
      privacy: 'Поверителност',
      privacySubtitle: 'Контролирайте какво други могат да видят',
      profileVisibility: 'Видимост на профила',
      public: 'Публичен',
      registeredOnly: 'Само регистрирани',
      private: 'Личен',
      personalInfo: 'Лична информация',
      showFullName: 'Покажи име',
      showEmail: 'Покажи имейл',
      showPhone: 'Покажи телефон',
      showAddress: 'Покажи адрес',
      showDateOfBirth: 'Покажи рождена дата',
      showPlaceOfBirth: 'Покажи място на раждане',
      statistics: 'Статистика',
      showTotalCars: 'Покажи брой коли',
      showTrustScore: 'Покажи рейтинг',
      showReviews: 'Покажи отзиви',
      saveSettings: 'Запази',
      socialMedia: 'Социални мрежи',
      socialSubtitle: 'Свържете акаунтите си',
      connect: 'Свържи',
      disconnect: 'Изключи',
      notConnected: 'Не е свързан',
      connected: 'Свързан',
      benefits: 'Предимства',
      benefitAuto: 'Автоматично споделяне',
      benefitReach: 'По-голям обхват',
      benefitTime: 'Спестяване на време',
      benefitUnified: 'Унифицирано управление'
    },
    en: {
      settings: 'Your account settings',
      customerNumber: 'Your customer number is',
      loginData: 'Login data',
      email: 'E-mail Address',
      confirmed: 'Confirmed',
      notConfirmed: 'Not confirmed',
      password: 'Password',
      change: 'Change',
      contactData: 'Contact data',
      name: 'Name',
      address: 'Address',
      phoneNumber: 'Phone number',
      activateFunctions: 'Activate additional functions',
      confirmPhone: 'Confirm phone number now',
      documents: 'Documents',
      myInvoices: 'My Invoices',
      invoicesDesc: 'Here you will find an overview of your booked packages and options',
      noInvoices: 'No Invoices available',
      show: 'Show',
      privacy: 'Privacy',
      privacySubtitle: 'Control what others can see in your profile',
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
      statistics: 'Statistics',
      showTotalCars: 'Show total cars',
      showTrustScore: 'Show trust score',
      showReviews: 'Show reviews',
      saveSettings: 'Save Settings',
      socialMedia: 'Social Media',
      socialSubtitle: 'Connect your accounts to automatically share posts across platforms',
      connect: 'Connect',
      disconnect: 'Disconnect',
      notConnected: 'Not Connected',
      connected: 'Connected',
      benefits: 'Benefits',
      benefitAuto: 'Automatic sharing',
      benefitReach: 'Wider reach',
      benefitTime: 'Save time',
      benefitUnified: 'Unified management'
    }
  };

  const text = t[language as 'bg' | 'en'];

  return (
    <PageLayout>
      {/* ⚡ SIDEBAR - mobile.de style */}
      <SettingsSidebar />

      {/* ⚡ MAIN CONTENT */}
      <Container>
        {/* ⚡ SETTINGS HEADER - Compact (mobile.de style) */}
        <PageHeader>
        <Settings size={20} />
        <h1>{text.settings}</h1>
      </PageHeader>

      {/* ⚡ CUSTOMER NUMBER - mobile.de style */}
      {user?.uid && (
        <CustomerNumber>
          {text.customerNumber}: <strong>{user.uid.substring(0, 8).toUpperCase()}</strong>
        </CustomerNumber>
      )}

      {/* ⚡ LOGIN DATA SECTION - mobile.de style */}
      <Section>
        <SectionTitle>{text.loginData}</SectionTitle>
        
        <DataRow>
          <DataLabel>
            <Mail size={16} />
            {text.email}
          </DataLabel>
          <DataValue>
            {user?.email || 'N/A'}
            {user?.emailVerified && (
              <StatusBadge $status="confirmed">
                <CheckCircle size={12} />
                {text.confirmed}
              </StatusBadge>
            )}
            {!user?.emailVerified && (
              <StatusBadge $status="notConfirmed">
                <AlertCircle size={12} />
                {text.notConfirmed}
              </StatusBadge>
            )}
          </DataValue>
          <ChangeButton>{text.change}</ChangeButton>
        </DataRow>

        <DataRow>
          <DataLabel>
            <Lock size={16} />
            {text.password}
          </DataLabel>
          <DataValue>••••••••••</DataValue>
          <ChangeButton>{text.change}</ChangeButton>
        </DataRow>
      </Section>

      {/* ⚡ CONTACT DATA SECTION - mobile.de style */}
      <Section>
        <SectionTitle>{text.contactData}</SectionTitle>
        
        <DataRow>
          <DataLabel>
            <UserIcon size={16} />
            {text.name}
          </DataLabel>
          <DataValue>{user?.displayName || 'N/A'}</DataValue>
          <ChangeButton>{text.change}</ChangeButton>
        </DataRow>

        <DataRow>
          <DataLabel>
            <MapPin size={16} />
            {text.address}
          </DataLabel>
          <DataValue>N/A</DataValue>
          <ChangeButton>{text.change}</ChangeButton>
        </DataRow>

        <DataRow>
          <DataLabel>
            <Phone size={16} />
            {text.phoneNumber}
          </DataLabel>
          <DataValue>
            {user?.phoneNumber || 'N/A'}
            {!user?.phoneNumber && (
              <StatusBadge $status="notConfirmed">
                <AlertCircle size={12} />
                {text.notConfirmed}
              </StatusBadge>
            )}
          </DataValue>
          <ChangeButton>{text.change}</ChangeButton>
        </DataRow>
        
        {!user?.phoneNumber && (
          <WarningBox>
            <AlertCircle size={16} color="#FF8F10" />
            <span>
              {text.activateFunctions}: <strong>{text.confirmPhone}</strong>
            </span>
          </WarningBox>
        )}
      </Section>

      {/* ⚡ DOCUMENTS SECTION - mobile.de style */}
      <Section>
        <SectionTitle>{text.documents}</SectionTitle>
        
        <DataRow>
          <DataLabel>
            <Settings size={16} />
            {text.myInvoices}
          </DataLabel>
          <DataValue style={{ fontSize: '0.75rem', color: '#999' }}>
            {text.invoicesDesc}
          </DataValue>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoBadge>
              <AlertCircle size={12} />
              {text.noInvoices}
            </InfoBadge>
            <ChangeButton disabled>{text.show}</ChangeButton>
          </div>
        </DataRow>
      </Section>

      {/* ⚡ PRIVACY SECTION - Compact */}
      <Section>
        <SectionHeader>
          <Shield size={18} />
          <div>
            <h2>{text.privacy}</h2>
            <p>{text.privacySubtitle}</p>
          </div>
        </SectionHeader>

        {/* Profile Visibility */}
        <SubSection>
          <SubSectionTitle>{text.profileVisibility}</SubSectionTitle>
          <VisibilityOptions>
            <VisibilityOption
              $active={privacySettings.profileVisibility === 'public'}
              onClick={() => handleVisibilityChange('public')}
            >
              <Unlock size={16} />
              <span>{text.public}</span>
            </VisibilityOption>
            <VisibilityOption
              $active={privacySettings.profileVisibility === 'registered_only'}
              onClick={() => handleVisibilityChange('registered_only')}
            >
              <Eye size={16} />
              <span>{text.registeredOnly}</span>
            </VisibilityOption>
            <VisibilityOption
              $active={privacySettings.profileVisibility === 'private'}
              onClick={() => handleVisibilityChange('private')}
            >
              <Lock size={16} />
              <span>{text.private}</span>
            </VisibilityOption>
          </VisibilityOptions>
        </SubSection>

        {/* Personal Information */}
        <SubSection>
          <SubSectionTitle>{text.personalInfo}</SubSectionTitle>
          <SettingsList>
            <SettingRow>
              <SettingLabel>
                <UserIcon size={14} />
                {text.showFullName}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showFullName}
                onClick={() => handlePrivacyToggle('showFullName')}
              >
                {privacySettings.showFullName ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
            <SettingRow>
              <SettingLabel>
                <Mail size={14} />
                {text.showEmail}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showEmail}
                onClick={() => handlePrivacyToggle('showEmail')}
              >
                {privacySettings.showEmail ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
            <SettingRow>
              <SettingLabel>
                <Phone size={14} />
                {text.showPhone}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showPhone}
                onClick={() => handlePrivacyToggle('showPhone')}
              >
                {privacySettings.showPhone ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
            <SettingRow>
              <SettingLabel>
                <MapPin size={14} />
                {text.showAddress}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showAddress}
                onClick={() => handlePrivacyToggle('showAddress')}
              >
                {privacySettings.showAddress ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
            <SettingRow>
              <SettingLabel>
                <Calendar size={14} />
                {text.showDateOfBirth}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showDateOfBirth}
                onClick={() => handlePrivacyToggle('showDateOfBirth')}
              >
                {privacySettings.showDateOfBirth ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
            <SettingRow>
              <SettingLabel>
                <MapPin size={14} />
                {text.showPlaceOfBirth}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showPlaceOfBirth}
                onClick={() => handlePrivacyToggle('showPlaceOfBirth')}
              >
                {privacySettings.showPlaceOfBirth ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
          </SettingsList>
        </SubSection>

        {/* Statistics */}
        <SubSection>
          <SubSectionTitle>{text.statistics}</SubSectionTitle>
          <SettingsList>
            <SettingRow>
              <SettingLabel>
                <BarChart3 size={14} />
                {text.showTotalCars}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showTotalCars}
                onClick={() => handlePrivacyToggle('showTotalCars')}
              >
                {privacySettings.showTotalCars ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
            <SettingRow>
              <SettingLabel>
                <Star size={14} />
                {text.showTrustScore}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showTrustScore}
                onClick={() => handlePrivacyToggle('showTrustScore')}
              >
                {privacySettings.showTrustScore ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
            <SettingRow>
              <SettingLabel>
                <MessageSquare size={14} />
                {text.showReviews}
              </SettingLabel>
              <ToggleSwitch
                $active={privacySettings.showReviews}
                onClick={() => handlePrivacyToggle('showReviews')}
              >
                {privacySettings.showReviews ? <Eye size={12} /> : <EyeOff size={12} />}
              </ToggleSwitch>
            </SettingRow>
          </SettingsList>
        </SubSection>

        {/* Save Button */}
        <SaveButton onClick={handleSavePrivacy} disabled={saving}>
          <Save size={16} />
          {saving ? (language === 'bg' ? 'Запазване...' : 'Saving...') : text.saveSettings}
        </SaveButton>
      </Section>

      {/* ⚡ SOCIAL MEDIA SECTION - Compact */}
      <Section>
        <SectionHeader>
          <LinkIcon size={18} />
          <div>
            <h2>{text.socialMedia}</h2>
            <p>{text.socialSubtitle}</p>
          </div>
        </SectionHeader>

        <SocialList>
          {(Object.keys(PLATFORM_CONFIGS) as SocialPlatform[]).map((platform) => {
            const config = PLATFORM_CONFIGS[platform];
            const connected = isConnected(platform);

            return (
              <SocialRow key={platform} $color={config.color}>
                <SocialIcon $color={config.color}>
                  {getSocialIcon(platform)}
                </SocialIcon>
                <SocialInfo>
                  <SocialName>{config.displayName[language]}</SocialName>
                  <SocialStatus $connected={connected}>
                    {connected ? (
                      <>
                        <CheckCircle size={12} />
                        {text.connected}
                      </>
                    ) : (
                      text.notConnected
                    )}
                  </SocialStatus>
                </SocialInfo>
                <SocialButton
                  $connected={connected}
                  $color={config.color}
                  onClick={() => connected ? handleDisconnectSocial(platform) : handleConnectSocial(platform)}
                  disabled={connecting === platform}
                >
                  {connecting === platform ? (
                    <RefreshCw size={14} className="spin" />
                  ) : connected ? (
                    <>
                      <Unlink size={14} />
                      {text.disconnect}
                    </>
                  ) : (
                    <>
                      <LinkIcon size={14} />
                      {text.connect}
                    </>
                  )}
                </SocialButton>
              </SocialRow>
            );
          })}
        </SocialList>

        {/* Benefits */}
        <BenefitsBox>
          <BenefitsTitle>{text.benefits}</BenefitsTitle>
          <BenefitsList>
            <BenefitItem>
              <CheckCircle size={14} color="#10b981" />
              {text.benefitAuto}
            </BenefitItem>
            <BenefitItem>
              <CheckCircle size={14} color="#10b981" />
              {text.benefitReach}
            </BenefitItem>
            <BenefitItem>
              <CheckCircle size={14} color="#10b981" />
              {text.benefitTime}
            </BenefitItem>
            <BenefitItem>
              <CheckCircle size={14} color="#10b981" />
              {text.benefitUnified}
            </BenefitItem>
          </BenefitsList>
        </BenefitsBox>
      </Section>
      </Container>
    </PageLayout>
  );
};

export default ProfileSettings;

// ==================== STYLED COMPONENTS ====================
// ⚡ OPTIMIZED: Compact & Professional (mobile.de inspired)

const PageLayout = styled.div`
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 1024px) {
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Container = styled.div`
  flex: 1;
  max-width: 700px;  /* ⚡ Reduced from 900px */
  
  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;  /* ⚡ Reduced */
  
  svg {
    color: #FF8F10;
  }
  
  h1 {
    margin: 0;
    font-size: 1.25rem;  /* ⚡ Reduced from 1.75rem */
    font-weight: 700;
    color: #333;
  }
`;

const CustomerNumber = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 20px;
  padding: 10px 14px;
  background: #f8f9fa;
  border-radius: 6px;
  
  strong {
    color: #333;
    font-weight: 600;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: background 0.15s ease;
  
  &:hover {
    background: #f0f0f0;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DataLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #555;
  
  svg {
    color: #999;
    flex-shrink: 0;
  }
`;

const DataValue = styled.div`
  flex: 1;
  font-size: 0.85rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $status: 'confirmed' | 'notConfirmed' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${p => p.$status === 'confirmed' ? '#dcfce7' : '#fee2e2'};
  color: ${p => p.$status === 'confirmed' ? '#16a34a' : '#dc2626'};
  white-space: nowrap;
`;

const ChangeButton = styled.button`
  padding: 6px 14px;
  border: 1.5px solid #a855f7;
  background: white;
  color: #a855f7;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #a855f7;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #ccc;
    color: #999;
  }
`;

const WarningBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #c2410c;
  
  strong {
    color: #FF8F10;
  }
`;

const InfoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  background: #e5e7eb;
  color: #6b7280;
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e0e0e0;  /* ⚡ Thinner border */
  border-radius: 10px;  /* ⚡ Reduced from 16px */
  padding: 16px;  /* ⚡ Reduced from 24px */
  margin-bottom: 16px;  /* ⚡ Reduced from 24px */
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;  /* ⚡ Reduced from 20px */
  
  svg {
    color: #FF8F10;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  h2 {
    margin: 0 0 4px 0;
    font-size: 1rem;  /* ⚡ Reduced from 1.2rem */
    font-weight: 600;
    color: #333;
  }
  
  p {
    margin: 0;
    font-size: 0.75rem;  /* ⚡ Reduced from 0.95rem */
    color: #666;
  }
`;

const SubSection = styled.div`
  margin-bottom: 16px;  /* ⚡ Reduced from 20px */
  
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const SubSectionTitle = styled.h3`
  margin: 0 0 10px 0;  /* ⚡ Reduced from 12px */
  font-size: 0.85rem;  /* ⚡ Reduced from 0.95rem */
  font-weight: 600;
  color: #555;
`;

const VisibilityOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));  /* ⚡ Reduced from 200px */
  gap: 8px;  /* ⚡ Reduced from 12px */
`;

const VisibilityOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;  /* ⚡ Reduced from 16px */
  border: 1.5px solid ${props => props.$active ? '#FF8F10' : '#e0e0e0'};  /* ⚡ Thinner */
  border-radius: 8px;  /* ⚡ Reduced from 12px */
  background: ${props => props.$active ? 'rgba(255, 143, 16, 0.08)' : '#fff'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    color: ${props => props.$active ? '#FF8F10' : '#999'};
    flex-shrink: 0;
  }
  
  span {
    font-size: 0.8rem;  /* ⚡ Smaller text */
    font-weight: ${props => props.$active ? '600' : '400'};
    color: ${props => props.$active ? '#FF8F10' : '#555'};
  }
  
  &:hover {
    border-color: #FF8F10;
    background: rgba(255, 143, 16, 0.05);
  }
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;  /* ⚡ Reduced from 12px */
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;  /* ⚡ Reduced from 12px 16px */
  background: #f9f9f9;
  border-radius: 6px;  /* ⚡ Reduced from 8px */
  transition: background 0.15s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const SettingLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;  /* ⚡ Reduced from 14px */
  color: #555;
  
  svg {
    color: #999;
    flex-shrink: 0;
  }
`;

const ToggleSwitch = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;  /* ⚡ Reduced from 48px */
  height: 22px;  /* ⚡ Reduced from 28px */
  background: ${props => props.$active ? '#FF8F10' : '#ccc'};
  border: none;
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  svg {
    color: white;
    position: absolute;
    left: ${props => props.$active ? '20px' : '4px'};  /* ⚡ Adjusted */
    transition: left 0.2s ease;
  }
  
  &:hover {
    opacity: 0.85;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 18px;  /* ⚡ Reduced from 14px 24px */
  background: linear-gradient(135deg, #FF8F10, #FF6B35);
  color: white;
  border: none;
  border-radius: 6px;  /* ⚡ Reduced from 8px */
  font-size: 0.875rem;  /* ⚡ Reduced from 1rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(255, 143, 16, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SocialList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;  /* ⚡ Reduced from 16px */
`;

const SocialRow = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;  /* ⚡ Reduced from 20px */
  background: #f9f9f9;
  border: 1px solid #e9ecef;
  border-radius: 8px;  /* ⚡ Reduced from 16px */
  transition: all 0.2s ease;

  &:hover {
    border-color: ${p => p.$color};
    background: white;
  }
`;

const SocialIcon = styled.div<{ $color: string }>`
  width: 36px;  /* ⚡ Reduced from 56px */
  height: 36px;  /* ⚡ Reduced from 56px */
  border-radius: 8px;  /* ⚡ Reduced from 12px */
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px ${p => p.$color}30;  /* ⚡ Lighter shadow */
`;

const SocialInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SocialName = styled.h4`
  font-size: 0.875rem;  /* ⚡ Reduced from 1.1rem */
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const SocialStatus = styled.span<{ $connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;  /* ⚡ Reduced from 0.9rem */
  color: ${p => p.$connected ? '#10b981' : '#999'};
  font-weight: 500;
`;

const SocialButton = styled.button<{ $connected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;  /* ⚡ Reduced from 10px 20px */
  border-radius: 16px;  /* ⚡ Reduced from 24px */
  border: 1.5px solid ${p => p.$connected ? '#e9ecef' : p.$color};
  background: ${p => p.$connected ? 'white' : p.$color};
  color: ${p => p.$connected ? '#666' : 'white'};
  font-size: 0.75rem;  /* ⚡ Reduced from 0.9rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${p => p.$connected ? '#f8f9fa' : p.$color}dd;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const BenefitsBox = styled.div`
  padding: 14px;  /* ⚡ Reduced from 24px */
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 8px;  /* ⚡ Reduced from 16px */
  border: 1px solid #e9ecef;
  margin-top: 16px;
`;

const BenefitsTitle = styled.h4`
  font-size: 0.85rem;  /* ⚡ Reduced from 1.2rem */
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
`;

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));  /* ⚡ Adjusted */
  gap: 8px;  /* ⚡ Reduced from 12px */
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;  /* ⚡ Reduced from 0.95rem */
  color: #666;
  font-weight: 500;
`;

const MessageBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #e9ecef;
  border-radius: 16px;
  min-height: 300px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
  }
  
  p {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: #666;
    line-height: 1.6;
    max-width: 500px;
  }
`;

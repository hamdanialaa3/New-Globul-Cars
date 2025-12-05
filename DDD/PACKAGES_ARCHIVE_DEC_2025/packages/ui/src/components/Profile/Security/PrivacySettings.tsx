// src/components/Profile/Security/PrivacySettings.tsx
// Privacy Settings Component
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';
import { Shield, Eye, EyeOff, Lock, Users, Bell, Download, Trash2, AlertCircle } from 'lucide-react';
import { deleteAccount } from '@globul-cars/services/security/delete-account.service';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #212529;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    color: #212529;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF7900;
    box-shadow: 0 2px 8px rgba(255, 121, 0, 0.1);
  }
`;

const SettingInfo = styled.div`
  flex: 1;
  
  .label {
    font-weight: 600;
    color: #212529;
    margin-bottom: 4px;
    font-size: 0.95rem;
  }
  
  .description {
    font-size: 0.85rem;
    color: #6c757d;
    line-height: 1.4;
  }
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 56px;
  height: 28px;
  background: ${props => props.$active ? '#FF7900' : '#dee2e6'};
  border: none;
  border-radius: 14px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: ${props => props.$active ? '31px' : '3px'};
    transition: left 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #212529;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
  }
`;

const DangerZone = styled.div`
  margin-top: 32px;
  padding: 20px;
  background: #fff5f5;
  border: 2px solid #dc3545;
  border-radius: 12px;
  
  h3 {
    color: #dc3545;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'danger' ? `
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #bb2d3b;
      transform: translateY(-1px);
    }
  ` : `
    background: #FF7900;
    color: white;
    
    &:hover {
      background: #e66d00;
      transform: translateY(-1px);
    }
  `}
`;

const SaveButton = styled(Button)`
  margin-top: 24px;
  width: 100%;
  justify-content: center;
  font-size: 1rem;
`;

interface PrivacySettingsState {
  profileVisibility: 'public' | 'followers' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showCars: boolean;
  allowMessages: 'everyone' | 'followers' | 'none';
  allowFollow: boolean;
  showOnlineStatus: boolean;
  dataCollectionConsent: boolean;
  marketingEmails: boolean;
}

interface PrivacySettingsProps {
  userId: string;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ userId }) => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<PrivacySettingsState>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showCars: true,
    allowMessages: 'everyone',
    allowFollow: true,
    showOnlineStatus: true,
    dataCollectionConsent: true,
    marketingEmails: false
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (userData?.privacy) {
        setSettings(prev => ({ ...prev, ...userData.privacy }));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'users', userId), {
        privacy: settings,
        'privacy.updatedAt': serverTimestamp()
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('❌ Save error:', error);
      alert(language === 'bg' ? 'Грешка при запазване' : 'Save error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `globul-cars-data-${userId}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const c1 = window.confirm(
      language === 'bg'
        ? 'Сигурни ли сте, че искате да изтриете акаунта си? Това действие е необратимо!'
        : 'Are you sure you want to delete your account? This action is irreversible!'
    );
    if (!c1) return;

    const c2 = window.prompt(
      language === 'bg' ? 'Въведете "DELETE" за потвърждение:' : 'Type "DELETE" to confirm:'
    );
    if (c2 !== 'DELETE') {
      alert(language === 'bg' ? 'Отказано' : 'Cancelled');
      return;
    }

    // Try direct deletion
    let result = await deleteAccount();
    if (result.reauthNeeded) {
      // Prompt for re-auth method
      const method = window.prompt(
        language === 'bg'
          ? 'За повторно удостоверяване въведете: password или google'
          : 'For re-authentication, type: password or google'
      );

      if (method === 'password') {
        const email = window.prompt(language === 'bg' ? 'Имейл:' : 'Email:') || '';
        const password = window.prompt(language === 'bg' ? 'Парола:' : 'Password:') || '';
        result = await deleteAccount({ method: 'password', email, password });
      } else if (method === 'google') {
        result = await deleteAccount({ method: 'google' });
      }
    }

    if (result.success) {
      alert(language === 'bg' ? 'Акаунтът е изтрит' : 'Account deleted');
      window.location.href = '/';
    } else {
      alert(
        language === 'bg'
          ? `Грешка при изтриване: ${result.error || ''}`
          : `Delete error: ${result.error || ''}`
      );
    }
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      bg: {
        title: 'Настройки за поверителност',
        profileVisibility: 'Видимост на профила',
        profileVisibilityDesc: 'Кой може да вижда вашия профил',
        public: 'Публичен',
        followers: 'Само последователи',
        private: 'Частен',
        showEmail: 'Покажи имейл',
        showEmailDesc: 'Показване на имейл адрес в профила',
        showPhone: 'Покажи телефон',
        showPhoneDesc: 'Показване на телефонен номер',
        showLocation: 'Покажи локация',
        showLocationDesc: 'Показване на град и регион',
        showCars: 'Покажи коли',
        showCarsDesc: 'Показване на вашите обяви',
        allowMessages: 'Съобщения от',
        allowMessagesDesc: 'Кой може да ви изпраща съобщения',
        everyone: 'Всички',
        allowFollow: 'Позволи следване',
        allowFollowDesc: 'Други потребители могат да ви следват',
        showOnlineStatus: 'Онлайн статус',
        showOnlineStatusDesc: 'Покажи когато сте онлайн',
        dataCollection: 'Събиране на данни',
        dataCollectionDesc: 'Съгласие за анализ и подобряване',
        marketingEmails: 'Маркетингови имейли',
        marketingEmailsDesc: 'Получавай новини и промоции',
        save: 'Запази промените',
        saved: 'Запазено!',
        exportData: 'Изтегли моите данни',
        deleteAccount: 'Изтрий акаунт',
        dangerZone: 'Опасна зона',
        deleteWarning: 'След изтриване на акаунта, всички данни ще бъдат премахнати завинаги.'
      },
      en: {
        title: 'Privacy Settings',
        profileVisibility: 'Profile Visibility',
        profileVisibilityDesc: 'Who can see your profile',
        public: 'Public',
        followers: 'Followers Only',
        private: 'Private',
        showEmail: 'Show Email',
        showEmailDesc: 'Display email address on profile',
        showPhone: 'Show Phone',
        showPhoneDesc: 'Display phone number',
        showLocation: 'Show Location',
        showLocationDesc: 'Display city and region',
        showCars: 'Show Cars',
        showCarsDesc: 'Display your listings',
        allowMessages: 'Messages from',
        allowMessagesDesc: 'Who can send you messages',
        everyone: 'Everyone',
        allowFollow: 'Allow Following',
        allowFollowDesc: 'Other users can follow you',
        showOnlineStatus: 'Online Status',
        showOnlineStatusDesc: 'Show when you are online',
        dataCollection: 'Data Collection',
        dataCollectionDesc: 'Consent for analytics and improvements',
        marketingEmails: 'Marketing Emails',
        marketingEmailsDesc: 'Receive news and promotions',
        save: 'Save Changes',
        saved: 'Saved!',
        exportData: 'Download My Data',
        deleteAccount: 'Delete Account',
        dangerZone: 'Danger Zone',
        deleteWarning: 'Once you delete your account, all data will be permanently removed.'
      }
    };
    
    return translations[language]?.[key] || key;
  };

  return (
    <Container>
      <Header>
        <Shield size={28} color="#FF7900" />
        <h2>{t('title')}</h2>
      </Header>

      {/* Profile Visibility */}
      <Section>
        <h3><Eye size={20} /> {t('profileVisibility')}</h3>
        <SettingItem>
          <SettingInfo>
            <div className="label">{t('profileVisibility')}</div>
            <div className="description">{t('profileVisibilityDesc')}</div>
          </SettingInfo>
          <Select
            value={settings.profileVisibility}
            onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value as any })}
          >
            <option value="public">{t('public')}</option>
            <option value="followers">{t('followers')}</option>
            <option value="private">{t('private')}</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <div className="label">{t('showEmail')}</div>
            <div className="description">{t('showEmailDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.showEmail}
            onClick={() => setSettings({ ...settings, showEmail: !settings.showEmail })}
          />
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <div className="label">{t('showPhone')}</div>
            <div className="description">{t('showPhoneDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.showPhone}
            onClick={() => setSettings({ ...settings, showPhone: !settings.showPhone })}
          />
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <div className="label">{t('showLocation')}</div>
            <div className="description">{t('showLocationDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.showLocation}
            onClick={() => setSettings({ ...settings, showLocation: !settings.showLocation })}
          />
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <div className="label">{t('showCars')}</div>
            <div className="description">{t('showCarsDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.showCars}
            onClick={() => setSettings({ ...settings, showCars: !settings.showCars })}
          />
        </SettingItem>
      </Section>

      {/* Interactions */}
      <Section>
        <h3><Users size={20} /> {t('allowMessages')}</h3>
        
        <SettingItem>
          <SettingInfo>
            <div className="label">{t('allowMessages')}</div>
            <div className="description">{t('allowMessagesDesc')}</div>
          </SettingInfo>
          <Select
            value={settings.allowMessages}
            onChange={(e) => setSettings({ ...settings, allowMessages: e.target.value as any })}
          >
            <option value="everyone">{t('everyone')}</option>
            <option value="followers">{t('followers')}</option>
            <option value="none">None</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <div className="label">{t('allowFollow')}</div>
            <div className="description">{t('allowFollowDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.allowFollow}
            onClick={() => setSettings({ ...settings, allowFollow: !settings.allowFollow })}
          />
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <div className="label">{t('showOnlineStatus')}</div>
            <div className="description">{t('showOnlineStatusDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.showOnlineStatus}
            onClick={() => setSettings({ ...settings, showOnlineStatus: !settings.showOnlineStatus })}
          />
        </SettingItem>
      </Section>

      {/* Data & Privacy */}
      <Section>
        <h3><Lock size={20} /> {t('dataCollection')}</h3>
        
        <SettingItem>
          <SettingInfo>
            <div className="label">{t('dataCollection')}</div>
            <div className="description">{t('dataCollectionDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.dataCollectionConsent}
            onClick={() => setSettings({ ...settings, dataCollectionConsent: !settings.dataCollectionConsent })}
          />
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <div className="label">{t('marketingEmails')}</div>
            <div className="description">{t('marketingEmailsDesc')}</div>
          </SettingInfo>
          <Toggle 
            $active={settings.marketingEmails}
            onClick={() => setSettings({ ...settings, marketingEmails: !settings.marketingEmails })}
          />
        </SettingItem>

        <Button onClick={handleExportData}>
          <Download size={18} />
          {t('exportData')}
        </Button>
      </Section>

      <SaveButton onClick={handleSave} disabled={loading}>
        {loading ? (language === 'bg' ? 'Запазва се...' : 'Saving...') : (saved ? t('saved') : t('save'))}
      </SaveButton>

      {/* Danger Zone */}
      <DangerZone>
        <h3>
          <AlertCircle size={20} />
          {t('dangerZone')}
        </h3>
        <p style={{ color: '#6c757d', marginBottom: '16px' }}>
          {t('deleteWarning')}
        </p>
        <Button $variant="danger" onClick={handleDeleteAccount}>
          <Trash2 size={18} />
          {t('deleteAccount')}
        </Button>
      </DangerZone>
    </Container>
  );
};

export default PrivacySettings;


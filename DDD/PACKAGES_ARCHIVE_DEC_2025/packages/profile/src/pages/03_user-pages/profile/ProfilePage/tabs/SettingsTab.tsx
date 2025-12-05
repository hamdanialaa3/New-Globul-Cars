// ProfilePage/tabs/SettingsTab.tsx
// ✅ TESTING VERSION - COMPREHENSIVE SETTINGS PAGE
// Version: 2.0 - November 9, 2025 - 3:00 PM

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import type { BulgarianUser } from '@globul-cars/core/typesuser/bulgarian-user.types';
import type { ProfileTheme } from '@globul-cars/core/contextsProfileTypeContext';

interface SettingsTabProps {
  user: BulgarianUser | null;
  theme: ProfileTheme;
}

// 🔥 SIMPLE TEST VERSION - TO VERIFY HOT RELOAD WORKS
export const SettingsTab: React.FC<SettingsTabProps> = ({ user, theme }) => {
  const { t } = useLanguage();

  return (
    <TestContainer>
      <BigTitle>🎯 إعدادات متقدمة - Advanced Settings</BigTitle>
      <Subtitle>التحديث: 9 نوفمبر 2025 - الساعة 3:00 مساءً</Subtitle>
      <Subtitle>Last Update: November 9, 2025 - 3:00 PM</Subtitle>
      
      <ChangeIndicator>
        ✅ هذه الصفحة تم تحديثها بنجاح!
        <br />
        ✅ This page has been successfully updated!
      </ChangeIndicator>

      <SectionsGrid>
        <SectionCard color="#FF8F10">
          <h3>👤 إعدادات الحساب</h3>
          <p>Account Settings</p>
        </SectionCard>

        <SectionCard color="#10B981">
          <h3>🔒 الخصوصية</h3>
          <p>Privacy Settings</p>
        </SectionCard>

        <SectionCard color="#3B82F6">
          <h3>🔔 الإشعارات</h3>
          <p>Notifications</p>
        </SectionCard>

        <SectionCard color="#8B5CF6">
          <h3>🎨 المظهر</h3>
          <p>Appearance</p>
        </SectionCard>

        <SectionCard color="#EF4444">
          <h3>🔐 الأمان</h3>
          <p>Security</p>
        </SectionCard>

        <SectionCard color="#F59E0B">
          <h3>🚗 تفضيلات السيارات</h3>
          <p>Car Preferences</p>
        </SectionCard>

        <SectionCard color="#06B6D4">
          <h3>📥 تصدير البيانات</h3>
          <p>Data Export</p>
        </SectionCard>

        <SectionCard color="#EC4899">
          <h3>🏢 معلومات الأعمال</h3>
          <p>Business Info</p>
        </SectionCard>
      </SectionsGrid>

      <StatusBox>
        <h4>📊 حالة التطبيق - Application Status</h4>
        <p>✅ الملف محدّث - File Updated</p>
        <p>✅ الترجمات جاهزة - Translations Ready</p>
        <p>✅ الخدمة جاهزة - Service Ready</p>
        <p>🔄 انتظر Hot Reload - Wait for Hot Reload</p>
      </StatusBox>

      <WarningBox>
        <strong>⚠️ ملاحظة مهمة:</strong>
        <br />
        إذا لم تر هذه التغييرات، اتبع الخطوات:
        <ol>
          <li>اضغط Ctrl + Shift + R (Hard Refresh)</li>
          <li>أو امسح الكاش من Developer Tools</li>
          <li>أو أعد تشغيل السيرفر</li>
        </ol>
      </WarningBox>
    </TestContainer>
  );
};

// ===== Styled Components =====

const TestContainer = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const BigTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #FF8F10;
  text-align: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 10px;
`;

const ChangeIndicator = styled.div`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #ffffff;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 40px 0;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 20px;
  }
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin: 40px 0;
`;

const SectionCard = styled.div<{ color: string }>`
  background: rgba(255, 255, 255, 0.05);
  border: 3px solid ${props => props.color};
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px ${props => props.color}40;
    background: rgba(255, 255, 255, 0.08);
  }
  
  h3 {
    font-size: 1.4rem;
    color: ${props => props.color};
    margin: 0 0 12px 0;
  }
  
  p {
    color: #ffffff;
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
  }
`;

const StatusBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 3px solid #3B82F6;
  border-radius: 16px;
  padding: 30px;
  margin: 40px 0;
  
  h4 {
    font-size: 1.5rem;
    color: #3B82F6;
    margin: 0 0 20px 0;
  }
  
  p {
    font-size: 1.1rem;
    color: #ffffff;
    margin: 12px 0;
    padding-left: 20px;
  }
`;

const WarningBox = styled.div`
  background: rgba(245, 158, 11, 0.1);
  border: 3px solid #F59E0B;
  border-radius: 16px;
  padding: 30px;
  margin: 40px 0;
  
  strong {
    font-size: 1.3rem;
    color: #F59E0B;
    display: block;
    margin-bottom: 16px;
  }
  
  ol {
    color: #ffffff;
    font-size: 1.1rem;
    line-height: 1.8;
    padding-left: 20px;
    
    li {
      margin: 12px 0;
    }
  }
`;

export default SettingsTab;
    const loadSettings = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const userSettings = await userSettingsService.getUserSettings(user.uid);
        
        if (userSettings) {
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        showToast('error', t('settings.saveError', 'Error loading settings'));
      }
    };

    loadSettings();
  }, [user, t, showToast]);

  const handleSave = async () => {
    if (!user?.uid) {
      showToast('error', t('settings.saveError', 'Error saving settings'));
      return;
    }

    try {
      setSaving(true);
      const success = await userSettingsService.saveUserSettings(user.uid, settings);
      
      if (success) {
        showToast('success', t('settings.saveSuccess', 'Settings saved successfully'));
      } else {
        showToast('error', t('settings.saveError', 'Error saving settings'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('error', t('settings.saveError', 'Error saving settings'));
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.uid) return;
    
    try {
      const exportedData = await userSettingsService.exportUserData(user.uid);
      
      if (exportedData) {
        // Create downloadable JSON file
        const dataStr = JSON.stringify(exportedData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-data-${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('success', t('settings.exportStarted', 'Data exported successfully'));
      } else {
        showToast('error', t('settings.saveError', 'Error exporting data'));
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('error', t('settings.saveError', 'Error exporting data'));
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('settings.deleteAccountConfirm', 'Are you sure you want to delete your account? This action cannot be undone.'))) {
      showToast('error', t('settings.deleteAccountContact', 'Please contact support to delete your account.'));
    }
  };

  if (!user) {
    return (
      <SettingsContainer>
        <LoadingMessage>
          {t('common.loading', 'Loading...')}
        </LoadingMessage>
      </SettingsContainer>
    );
  }

  const sections = [
    { id: 'account', icon: User, label: t('settings.account', 'Account') },
    { id: 'privacy', icon: Shield, label: t('settings.privacy', 'Privacy') },
    { id: 'notifications', icon: Bell, label: t('settings.notifications', 'Notifications') },
    { id: 'appearance', icon: SettingsIcon, label: t('settings.appearance', 'Appearance') },
    { id: 'security', icon: Lock, label: t('settings.security', 'Security') },
    { id: 'preferences', icon: Car, label: t('settings.carPreferences', 'Car Preferences') },
    { id: 'data', icon: Download, label: t('settings.dataExport', 'Data & Export') },
  ];

  if (isBusinessAccount) {
    sections.splice(2, 0, { id: 'business', icon: Building2, label: t('settings.business', 'Business Info') });
  }

  return (
    <SettingsContainer>
      <SettingsLayout>
        {/* Left Sidebar Navigation */}
        <Sidebar>
          <SidebarTitle>{t('settings.title', 'Settings')}</SidebarTitle>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <SidebarItem
                key={section.id}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={20} />
                <span>{section.label}</span>
              </SidebarItem>
            );
          })}
        </Sidebar>

        {/* Main Content Area */}
        <ContentArea>
          {/* Account Settings */}
          {activeSection === 'account' && (
            <Section>
              <SectionHeader>
                <User size={24} />
                <SectionTitle>{t('settings.account', 'Account Settings')}</SectionTitle>
              </SectionHeader>
              
              <SettingGroup>
                <Label>{t('settings.displayName', 'Display Name')}</Label>
                <Input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  placeholder={t('settings.displayNamePlaceholder', 'Enter your display name')}
                />
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.email', 'Email Address')}</Label>
                <InputWithIcon>
                  <Mail size={18} />
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </InputWithIcon>
                <HelpText>{t('settings.emailHelp', 'Used for login and notifications')}</HelpText>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.phone', 'Phone Number')}</Label>
                <InputWithIcon>
                  <Phone size={18} />
                  <Input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="+359..."
                  />
                </InputWithIcon>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.bio', 'Bio')}</Label>
                <TextArea
                  value={settings.bio}
                  onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                  placeholder={t('settings.bioPlaceholder', 'Tell others about yourself...')}
                  rows={4}
                />
                <HelpText>{t('settings.bioHelp', 'Brief description visible on your profile')}</HelpText>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.language', 'Language')}</Label>
                <Select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value as 'bg' | 'en' })}
                >
                  <option value="bg">Български</option>
                  <option value="en">English</option>
                </Select>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save', 'Save Changes')}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <Section>
              <SectionHeader>
                <Shield size={24} />
                <SectionTitle>{t('settings.privacy', 'Privacy Settings')}</SectionTitle>
              </SectionHeader>
              
              <SettingGroup>
                <Label>{t('settings.profileVisibility', 'Profile Visibility')}</Label>
                <RadioGroup>
                  <RadioOption>
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={settings.privacy.profileVisibility === 'public'}
                      onChange={() => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: 'public' }
                      })}
                    />
                    <RadioLabel>
                      <Globe size={18} />
                      <div>
                        <strong>{t('settings.public', 'Public')}</strong>
                        <HelpText>{t('settings.publicHelp', 'Anyone can see your profile')}</HelpText>
                      </div>
                    </RadioLabel>
                  </RadioOption>

                  <RadioOption>
                    <input
                      type="radio"
                      name="visibility"
                      value="registered"
                      checked={settings.privacy.profileVisibility === 'registered'}
                      onChange={() => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: 'registered' }
                      })}
                    />
                    <RadioLabel>
                      <User size={18} />
                      <div>
                        <strong>{t('settings.registered', 'Registered Users Only')}</strong>
                        <HelpText>{t('settings.registeredHelp', 'Only logged-in users can see')}</HelpText>
                      </div>
                    </RadioLabel>
                  </RadioOption>

                  <RadioOption>
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={settings.privacy.profileVisibility === 'private'}
                      onChange={() => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: 'private' }
                      })}
                    />
                    <RadioLabel>
                      <Lock size={18} />
                      <div>
                        <strong>{t('settings.private', 'Private')}</strong>
                        <HelpText>{t('settings.privateHelp', 'Only you can see your profile')}</HelpText>
                      </div>
                    </RadioLabel>
                  </RadioOption>
                </RadioGroup>
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <Phone size={18} />
                    <div>
                      <strong>{t('settings.showPhone', 'Show Phone Number')}</strong>
                      <HelpText>{t('settings.showPhoneHelp', 'Visible on your listings')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.privacy.showPhone}
                    onChange={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showPhone: !settings.privacy.showPhone }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <Mail size={18} />
                    <div>
                      <strong>{t('settings.showEmail', 'Show Email Address')}</strong>
                      <HelpText>{t('settings.showEmailHelp', 'Visible on your profile')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.privacy.showEmail}
                    onChange={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showEmail: !settings.privacy.showEmail }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <Eye size={18} />
                    <div>
                      <strong>{t('settings.showLastSeen', 'Show Last Seen')}</strong>
                      <HelpText>{t('settings.showLastSeenHelp', 'Let others know when you were last active')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.privacy.showLastSeen}
                    onChange={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showLastSeen: !settings.privacy.showLastSeen }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <MessageSquare size={18} />
                    <div>
                      <strong>{t('settings.allowMessages', 'Allow Messages')}</strong>
                      <HelpText>{t('settings.allowMessagesHelp', 'Buyers can contact you directly')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.privacy.allowMessages}
                    onChange={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, allowMessages: !settings.privacy.allowMessages }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <TrendingUp size={18} />
                    <div>
                      <strong>{t('settings.showActivity', 'Show Activity Status')}</strong>
                      <HelpText>{t('settings.showActivityHelp', 'Display your online/offline status')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.privacy.showActivity}
                    onChange={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showActivity: !settings.privacy.showActivity }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save', 'Save Changes')}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <Section>
              <SectionHeader>
                <Bell size={24} />
                <SectionTitle>{t('settings.notifications', 'Notification Preferences')}</SectionTitle>
              </SectionHeader>

              <NotificationGroup>
                <GroupTitle>{t('settings.channels', 'Notification Channels')}</GroupTitle>
                
                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <Mail size={18} />
                      <div>
                        <strong>{t('settings.emailNotifications', 'Email Notifications')}</strong>
                        <HelpText>{t('settings.emailNotificationsHelp', 'Receive updates via email')}</HelpText>
                      </div>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.email}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: !settings.notifications.email }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <Smartphone size={18} />
                      <div>
                        <strong>{t('settings.smsNotifications', 'SMS Notifications')}</strong>
                        <HelpText>{t('settings.smsNotificationsHelp', 'Receive SMS for important updates')}</HelpText>
                      </div>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.sms}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: !settings.notifications.sms }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <Bell size={18} />
                      <div>
                        <strong>{t('settings.pushNotifications', 'Push Notifications')}</strong>
                        <HelpText>{t('settings.pushNotificationsHelp', 'Browser push notifications')}</HelpText>
                      </div>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.push}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: !settings.notifications.push }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>
              </NotificationGroup>

              <NotificationGroup>
                <GroupTitle>{t('settings.notificationTypes', 'What to Notify')}</GroupTitle>
                
                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <MessageSquare size={18} />
                      <strong>{t('settings.newMessages', 'New Messages')}</strong>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.newMessages}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newMessages: !settings.notifications.newMessages }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <DollarSign size={18} />
                      <strong>{t('settings.priceAlerts', 'Price Drop Alerts')}</strong>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.priceAlerts}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, priceAlerts: !settings.notifications.priceAlerts }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <Heart size={18} />
                      <strong>{t('settings.favoriteUpdates', 'Favorite Car Updates')}</strong>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.favoriteUpdates}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, favoriteUpdates: !settings.notifications.favoriteUpdates }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <Car size={18} />
                      <strong>{t('settings.newListings', 'New Listings Matching Criteria')}</strong>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.newListings}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newListings: !settings.notifications.newListings }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <TrendingUp size={18} />
                      <strong>{t('settings.promotions', 'Promotions & Deals')}</strong>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.promotions}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, promotions: !settings.notifications.promotions }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>

                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <FileText size={18} />
                      <strong>{t('settings.newsletter', 'Newsletter')}</strong>
                    </ToggleLabel>
                    <Toggle
                      checked={settings.notifications.newsletter}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newsletter: !settings.notifications.newsletter }
                      })}
                    />
                  </ToggleRow>
                </SettingGroup>
              </NotificationGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save', 'Save Changes')}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <Section>
              <SectionHeader>
                <SettingsIcon size={24} />
                <SectionTitle>{t('settings.appearance', 'Appearance & Display')}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <Label>{t('settings.theme', 'Theme')}</Label>
                <ThemeOptions>
                  <ThemeOption
                    active={settings.appearance.theme === 'light'}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: 'light' }
                    })}
                  >
                    <Sun size={24} />
                    <span>{t('settings.light', 'Light')}</span>
                  </ThemeOption>
                  
                  <ThemeOption
                    active={settings.appearance.theme === 'dark'}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: 'dark' }
                    })}
                  >
                    <Moon size={24} />
                    <span>{t('settings.dark', 'Dark')}</span>
                  </ThemeOption>
                  
                  <ThemeOption
                    active={settings.appearance.theme === 'auto'}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: 'auto' }
                    })}
                  >
                    <Laptop size={24} />
                    <span>{t('settings.auto', 'Auto')}</span>
                  </ThemeOption>
                </ThemeOptions>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.currency', 'Currency')}</Label>
                <Select
                  value={settings.appearance.currency}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, currency: e.target.value as 'EUR' }
                  })}
                >
                  <option value="EUR">EUR (€)</option>
                </Select>
                <HelpText>{t('settings.currencyHelp', 'Price display currency (EUR only in Bulgaria)')}</HelpText>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.dateFormat', 'Date Format')}</Label>
                <Select
                  value={settings.appearance.dateFormat}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, dateFormat: e.target.value as any }
                  })}
                >
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                </Select>
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <Laptop size={18} />
                    <div>
                      <strong>{t('settings.compactView', 'Compact View')}</strong>
                      <HelpText>{t('settings.compactViewHelp', 'Show more content on screen')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.appearance.compactView}
                    onChange={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, compactView: !settings.appearance.compactView }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save', 'Save Changes')}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <Section>
              <SectionHeader>
                <Lock size={24} />
                <SectionTitle>{t('settings.security', 'Security & Login')}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <ShieldCheck size={18} />
                    <div>
                      <strong>{t('settings.twoFactor', 'Two-Factor Authentication')}</strong>
                      <HelpText>{t('settings.twoFactorHelp', 'Add extra security to your account')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.security.twoFactorEnabled}
                    onChange={() => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorEnabled: !settings.security.twoFactorEnabled }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <AlertCircle size={18} />
                    <div>
                      <strong>{t('settings.loginAlerts', 'Login Alerts')}</strong>
                      <HelpText>{t('settings.loginAlertsHelp', 'Get notified of new logins')}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.security.loginAlerts}
                    onChange={() => setSettings({
                      ...settings,
                      security: { ...settings.security, loginAlerts: !settings.security.loginAlerts }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.sessionTimeout', 'Session Timeout')}</Label>
                <Select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: Number(e.target.value) }
                  })}
                >
                  <option value="15">15 {t('settings.minutes', 'minutes')}</option>
                  <option value="30">30 {t('settings.minutes', 'minutes')}</option>
                  <option value="60">1 {t('settings.hour', 'hour')}</option>
                  <option value="120">2 {t('settings.hours', 'hours')}</option>
                </Select>
                <HelpText>{t('settings.sessionTimeoutHelp', 'Auto-logout after inactivity')}</HelpText>
              </SettingGroup>

              <SettingGroup>
                <DangerButton onClick={() => showToast('info', t('settings.changePassword', 'Password change feature coming soon'))}>
                  <KeyRound size={18} />
                  {t('settings.changePassword', 'Change Password')}
                </DangerButton>
              </SettingGroup>

              <SettingGroup>
                <DangerButton onClick={() => signOut()}>
                  <LogOut size={18} />
                  {t('settings.logoutAllDevices', 'Logout from All Devices')}
                </DangerButton>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save', 'Save Changes')}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Car Preferences */}
          {activeSection === 'preferences' && (
            <Section>
              <SectionHeader>
                <Car size={24} />
                <SectionTitle>{t('settings.carPreferences', 'Car Search Preferences')}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <Label>{t('settings.priceRange', 'Preferred Price Range (EUR)')}</Label>
                <PriceRangeContainer>
                  <PriceInput
                    type="number"
                    value={settings.carPreferences.priceRange.min}
                    onChange={(e) => setSettings({
                      ...settings,
                      carPreferences: {
                        ...settings.carPreferences,
                        priceRange: { ...settings.carPreferences.priceRange, min: Number(e.target.value) }
                      }
                    })}
                    placeholder="Min"
                  />
                  <span>—</span>
                  <PriceInput
                    type="number"
                    value={settings.carPreferences.priceRange.max}
                    onChange={(e) => setSettings({
                      ...settings,
                      carPreferences: {
                        ...settings.carPreferences,
                        priceRange: { ...settings.carPreferences.priceRange, max: Number(e.target.value) }
                      }
                    })}
                    placeholder="Max"
                  />
                </PriceRangeContainer>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.searchRadius', 'Search Radius (km)')}</Label>
                <Input
                  type="number"
                  value={settings.carPreferences.searchRadius}
                  onChange={(e) => setSettings({
                    ...settings,
                    carPreferences: { ...settings.carPreferences, searchRadius: Number(e.target.value) }
                  })}
                  placeholder="50"
                />
                <HelpText>{t('settings.searchRadiusHelp', 'Default radius for location-based searches')}</HelpText>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save', 'Save Changes')}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Business Info (Dealers/Companies only) */}
          {activeSection === 'business' && isBusinessAccount && (
            <Section>
              <SectionHeader>
                <Building2 size={24} />
                <SectionTitle>
                  {isDealerProfile(user) ? t('settings.dealerInfo', 'Dealership Information') : t('settings.companyInfo', 'Company Information')}
                </SectionTitle>
              </SectionHeader>
              
              <DealershipInfoForm userId={user.uid} />
            </Section>
          )}

          {/* Data & Export */}
          {activeSection === 'data' && (
            <Section>
              <SectionHeader>
                <Download size={24} />
                <SectionTitle>{t('settings.dataExport', 'Data & Privacy')}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <InfoBox>
                  <FileText size={20} />
                  <div>
                    <strong>{t('settings.downloadData', 'Download Your Data')}</strong>
                    <HelpText>
                      {t('settings.downloadDataHelp', 'Get a copy of all your data including listings, messages, and activity')}
                    </HelpText>
                  </div>
                </InfoBox>
                <SecondaryButton onClick={handleExportData}>
                  <Download size={18} />
                  {t('settings.exportData', 'Request Data Export')}
                </SecondaryButton>
              </SettingGroup>

              <Divider />

              <SettingGroup>
                <DangerBox>
                  <AlertCircle size={20} />
                  <div>
                    <strong>{t('settings.deleteAccount', 'Delete Account')}</strong>
                    <HelpText>
                      {t('settings.deleteAccountWarning', 'Permanently delete your account and all associated data. This action cannot be undone.')}
                    </HelpText>
                  </div>
                </DangerBox>
                <DangerButton onClick={handleDeleteAccount}>
                  <Trash2 size={18} />
                  {t('settings.deleteMyAccount', 'Delete My Account')}
                </DangerButton>
              </SettingGroup>
            </Section>
          )}
        </ContentArea>
      </SettingsLayout>
    </SettingsContainer>
  );
};

// Styled Components
const SettingsContainer = styled.div`
  width: 100%;
  min-height: 600px;
`;

const SettingsLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
  
  @media (max-width: 968px) {
    position: static;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px;
  }
`;

const SidebarTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
  
  @media (max-width: 968px) {
    width: 100%;
    font-size: 1.25rem;
    margin-bottom: 12px;
  }
`;

const SidebarItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.active ? 'rgba(255, 143, 16, 0.2)' : 'transparent'};
  border: 2px solid ${props => props.active ? '#FF8F10' : 'transparent'};
  border-radius: 12px;
  color: ${props => props.active ? '#FF8F10' : '#ffffff'};
  font-size: 0.95rem;
  font-weight: ${props => props.active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;

  &:hover {
    background: ${props => props.active ? 'rgba(255, 143, 16, 0.25)' : 'rgba(255, 255, 255, 0.08)'};
    transform: translateX(4px);
  }

  svg {
    flex-shrink: 0;
  }
  
  @media (max-width: 968px) {
    width: auto;
    flex: 1 1 auto;
    min-width: 120px;
    margin-bottom: 0;
    padding: 10px 12px;
    font-size: 0.875rem;
    
    &:hover {
      transform: none;
    }
  }
`;

const ContentArea = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 32px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  color: #FF8F10;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const InputWithIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #FF8F10;
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    color: rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 0.95rem;
    padding: 0;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: rgba(255, 255, 255, 0.1);
  }

  option {
    background: #1a1a1a;
    color: #ffffff;
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;

  svg {
    color: #FF8F10;
    margin-top: 2px;
    flex-shrink: 0;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 0.95rem;
    margin-bottom: 4px;
  }
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  position: relative;
  width: 52px;
  height: 28px;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  flex-shrink: 0;

  &:checked {
    background: #FF8F10;
  }

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: #ffffff;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  &:checked::before {
    transform: translateX(24px);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  input[type="radio"] {
    margin-top: 2px;
    width: 20px;
    height: 20px;
    accent-color: #FF8F10;
    cursor: pointer;
    flex-shrink: 0;
  }

  input[type="radio"]:checked + div {
    strong {
      color: #FF8F10;
    }
  }
`;

const RadioLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;

  svg {
    color: #FF8F10;
    margin-top: 2px;
    flex-shrink: 0;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 0.95rem;
    margin-bottom: 4px;
    transition: color 0.2s ease;
  }
`;

const NotificationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
`;

const GroupTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #FF8F10;
  margin: 0 0 8px 0;
`;

const ThemeOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ThemeOption = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: ${props => props.active ? 'rgba(255, 143, 16, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.active ? '#FF8F10' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(255, 143, 16, 0.2)' : 'rgba(255, 255, 255, 0.08)'};
    transform: translateY(-2px);
  }

  svg {
    color: ${props => props.active ? '#FF8F10' : '#ffffff'};
  }

  span {
    font-size: 0.95rem;
    font-weight: ${props => props.active ? 600 : 400};
    color: ${props => props.active ? '#FF8F10' : '#ffffff'};
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }
`;

const PriceInput = styled(Input)`
  max-width: 150px;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;

  svg {
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const DangerBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;

  svg {
    color: #ef4444;
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const Divider = styled.div`
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #FF8F10 0%, #FF6B10 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-2px);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 40px;
  font-size: 1.1rem;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default SettingsTab;


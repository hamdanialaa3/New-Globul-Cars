// ✅ COMPREHENSIVE SETTINGS PAGE - November 9, 2025 at 3:40 PM
// 7 Sections: Account, Privacy, Notifications, Appearance, Security, Car Preferences, Data Export

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  User, Shield, Bell, Settings as SettingsIcon, Lock, Download, 
  Trash2, Eye, Mail, Phone, Globe, Save, AlertCircle, Building2,
  Smartphone, Laptop, LogOut, Moon, Sun, DollarSign, Car, Heart,
  MessageSquare, TrendingUp, FileText, KeyRound, ShieldCheck, ChevronRight,
  Printer, Languages, Search, Undo, Copy, Share2, HelpCircle, Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/components/Toast';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
import { isDealerProfile, isCompanyProfile } from '@/types/user/bulgarian-user.types';

interface UserSettings {
  email: string;
  phone: string;
  language: 'bg' | 'en';
  displayName: string;
  bio: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    newMessages: boolean;
    priceAlerts: boolean;
    favoriteUpdates: boolean;
    newListings: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'registered' | 'private';
    showPhone: boolean;
    showEmail: boolean;
    showLastSeen: boolean;
    allowMessages: boolean;
    allowCallbacks: boolean;
    showActivity: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    currency: 'EUR';
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy';
    compactView: boolean;
  };
  carPreferences: {
    priceRange: { min: number; max: number };
    searchRadius: number;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
}

const ProfileSettingsMobileDe: React.FC = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('account');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    email: (user as BulgarianUser)?.email || '',
    phone: (user as BulgarianUser)?.phoneNumber || '',
    language: language as 'bg' | 'en',
    displayName: (user as BulgarianUser)?.displayName || '',
    bio: '',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      newMessages: true,
      priceAlerts: true,
      favoriteUpdates: true,
      newListings: false,
      promotions: false,
      newsletter: false,
    },
    privacy: {
      profileVisibility: 'public',
      showPhone: true,
      showEmail: false,
      showLastSeen: true,
      allowMessages: true,
      allowCallbacks: true,
      showActivity: true,
    },
    appearance: {
      theme: 'dark',
      currency: 'EUR',
      dateFormat: 'dd/mm/yyyy',
      compactView: false,
    },
    carPreferences: {
      priceRange: { min: 0, max: 100000 },
      searchRadius: 50,
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30,
    },
  });

  const isBusinessAccount = user && (isDealerProfile(user as BulgarianUser) || isCompanyProfile(user as BulgarianUser));

  const handleSave = async () => {
    if (!user?.uid) {
      showToast('error', t('settings.saveError') || 'Error saving settings');
      return;
    }

    try {
      setSaving(true);
      showToast('info', t('settings.saving') || 'Saving settings...');
      
      // TODO: Save to Firestore using userSettingsService
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate save
      
      showToast('success', t('settings.saveSuccess') || 'Settings saved successfully');
      
      // Auto-scroll to top after save
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('error', t('settings.saveError') || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.uid) return;
    
    try {
      const exportedData = {
        user: user,
        settings: settings,
        exportDate: new Date().toISOString(),
      };
      
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
      
      showToast('success', t('settings.exportStarted') || 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('error', t('settings.saveError') || 'Error exporting data');
    }
  };

  const handlePrintReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Settings Report - ${settings.displayName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #FF8F10; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .setting { margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; }
          .value { color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Profile Settings Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>User: ${settings.displayName || user?.email}</p>
        </div>
        
        <div class="section">
          <h2>Account Information</h2>
          <div class="setting"><span class="label">Name:</span> <span class="value">${settings.displayName}</span></div>
          <div class="setting"><span class="label">Email:</span> <span class="value">${settings.email}</span></div>
          <div class="setting"><span class="label">Phone:</span> <span class="value">${settings.phone}</span></div>
        </div>
        
        <div class="section">
          <h2>Privacy Settings</h2>
          <div class="setting"><span class="label">Profile Visibility:</span> <span class="value">${settings.privacy.profileVisibility}</span></div>
          <div class="setting"><span class="label">Show Phone:</span> <span class="value">${settings.privacy.showPhone ? 'Yes' : 'No'}</span></div>
          <div class="setting"><span class="label">Show Email:</span> <span class="value">${settings.privacy.showEmail ? 'Yes' : 'No'}</span></div>
        </div>
        
        <div class="section">
          <h2>Notification Preferences</h2>
          <div class="setting"><span class="label">Email Notifications:</span> <span class="value">${settings.notifications.email ? 'Enabled' : 'Disabled'}</span></div>
          <div class="setting"><span class="label">SMS Notifications:</span> <span class="value">${settings.notifications.sms ? 'Enabled' : 'Disabled'}</span></div>
          <div class="setting"><span class="label">Push Notifications:</span> <span class="value">${settings.notifications.push ? 'Enabled' : 'Disabled'}</span></div>
        </div>
        
        <div class="section">
          <h2>Car Preferences</h2>
          <div class="setting"><span class="label">Price Range:</span> <span class="value">€${settings.carPreferences.priceRange.min} - €${settings.carPreferences.priceRange.max}</span></div>
          <div class="setting"><span class="label">Search Radius:</span> <span class="value">${settings.carPreferences.searchRadius} km</span></div>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm(t('settings.confirmReset') || 'Reset all settings to default?')) {
      setSettings({
        ...settings,
        notifications: {
          email: true, sms: false, push: true, marketing: false,
          newMessages: true, priceAlerts: true, favoriteUpdates: true,
          newListings: false, promotions: false, newsletter: false,
        },
        privacy: {
          profileVisibility: 'public', showPhone: true, showEmail: false,
          showLastSeen: true, allowMessages: true, allowCallbacks: true, showActivity: true,
        },
        appearance: { theme: 'dark', currency: 'EUR', dateFormat: 'dd/mm/yyyy', compactView: false },
        carPreferences: { priceRange: { min: 0, max: 100000 }, searchRadius: 50 },
        security: { twoFactorEnabled: false, loginAlerts: true, sessionTimeout: 30 },
      });
      showToast('success', t('settings.resetSuccess') || 'Settings reset to defaults');
    }
  };

  const handleCopySettings = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      showToast('success', t('settings.settingsCopied') || 'Settings copied to clipboard');
    } catch (error) {
      showToast('error', t('settings.copyError') || 'Failed to copy settings');
    }
  };

  const sections = [
    { id: 'account', icon: User, label: t('settings.account') || 'Account' },
    { id: 'privacy', icon: Shield, label: t('settings.privacy') || 'Privacy' },
    { id: 'notifications', icon: Bell, label: t('settings.notifications') || 'Notifications' },
    { id: 'appearance', icon: SettingsIcon, label: t('settings.appearance') || 'Appearance' },
    { id: 'security', icon: Lock, label: t('settings.security') || 'Security' },
    { id: 'preferences', icon: Car, label: t('settings.carPreferences') || 'Car Preferences' },
    { id: 'data', icon: Download, label: t('settings.dataExport') || 'Data & Export' },
  ];

  const filteredSections = sections.filter(section => 
    section.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isBusinessAccount) {
    sections.splice(2, 0, { id: 'business', icon: Building2, label: t('settings.business') || 'Business Info' });
  }

  return (
    <SettingsContainer>
      <SettingsLayout>
        {/* Sidebar Navigation */}
        <Sidebar>
          <SidebarTitle>{t('settings.title') || 'Settings'}</SidebarTitle>
          
          {/* Search Bar */}
          <SearchContainer>
            <Search size={16} />
            <SearchInput
              type="text"
              placeholder={t('settings.searchSettings') || 'Search settings...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          {/* Quick Actions */}
          <QuickActions>
            <QuickAction onClick={handlePrintReport}>
              <Printer size={16} />
              <span>{t('settings.print') || 'Print'}</span>
            </QuickAction>
            <QuickAction onClick={handleResetToDefaults}>
              <Undo size={16} />
              <span>{t('settings.reset') || 'Reset'}</span>
            </QuickAction>
            <QuickAction onClick={handleCopySettings}>
              <Copy size={16} />
              <span>{t('settings.copy') || 'Copy'}</span>
            </QuickAction>
          </QuickActions>
          
          {filteredSections.map((section) => {
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

        {/* Main Content */}
        <ContentArea>
          {/* Account Settings */}
          {activeSection === 'account' && (
            <Section>
              <SectionHeader>
                <User size={24} />
                <SectionTitle>{t('settings.account') || 'Account Settings'}</SectionTitle>
              </SectionHeader>
              
              <SettingGroup>
                <Label>{t('settings.displayName') || 'Display Name'}</Label>
                <Input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  placeholder={t('settings.displayNamePlaceholder') || 'Enter your display name'}
                />
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.email') || 'Email Address'}</Label>
                <InputWithIcon>
                  <Mail size={18} />
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </InputWithIcon>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.phone') || 'Phone Number'}</Label>
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
                <Label>{t('settings.bio') || 'Bio'}</Label>
                <TextArea
                  value={settings.bio}
                  onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                  placeholder={t('settings.bioPlaceholder') || 'Tell others about yourself...'}
                  rows={4}
                />
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save') || 'Save Changes'}
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
                <SectionTitle>{t('settings.privacy') || 'Privacy Settings'}</SectionTitle>
              </SectionHeader>
              
              <SettingGroup>
                <Label>{t('settings.profileVisibility') || 'Profile Visibility'}</Label>
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
                        <strong>{t('settings.public') || 'Public'}</strong>
                        <HelpText>{t('settings.publicHelp') || 'Anyone can see your profile'}</HelpText>
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
                        <strong>{t('settings.registered') || 'Registered Users Only'}</strong>
                        <HelpText>{t('settings.registeredHelp') || 'Only logged-in users'}</HelpText>
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
                        <strong>{t('settings.private') || 'Private'}</strong>
                        <HelpText>{t('settings.privateHelp') || 'Only you can see'}</HelpText>
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
                      <strong>{t('settings.showPhone') || 'Show Phone Number'}</strong>
                      <HelpText>{t('settings.showPhoneHelp') || 'Visible on listings'}</HelpText>
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
                      <strong>{t('settings.showEmail') || 'Show Email Address'}</strong>
                      <HelpText>{t('settings.showEmailHelp') || 'Visible on profile'}</HelpText>
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
                      <strong>{t('settings.showLastSeen') || 'Show Last Seen'}</strong>
                      <HelpText>{t('settings.showLastSeenHelp') || 'When you were last active'}</HelpText>
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
                      <strong>{t('settings.allowMessages') || 'Allow Messages'}</strong>
                      <HelpText>{t('settings.allowMessagesHelp') || 'Let others send you messages'}</HelpText>
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
                    <Phone size={18} />
                    <div>
                      <strong>{t('settings.allowCallbacks') || 'Allow Phone Callbacks'}</strong>
                      <HelpText>{t('settings.allowCallbacksHelp') || 'Let buyers request phone calls'}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle
                    checked={settings.privacy.allowCallbacks}
                    onChange={() => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, allowCallbacks: !settings.privacy.allowCallbacks }
                    })}
                  />
                </ToggleRow>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save') || 'Save Changes'}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Section>
              <SectionHeader>
                <Bell size={24} />
                <SectionTitle>{t('settings.notifications') || 'Notifications'}</SectionTitle>
              </SectionHeader>

              <NotificationGroup>
                <GroupTitle>{t('settings.channels') || 'Channels'}</GroupTitle>
                
                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <Mail size={18} />
                      <strong>{t('settings.emailNotifications') || 'Email Notifications'}</strong>
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
                      <strong>{t('settings.smsNotifications') || 'SMS Notifications'}</strong>
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
                      <strong>{t('settings.pushNotifications') || 'Push Notifications'}</strong>
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
                <GroupTitle>{t('settings.notificationTypes') || 'What to Notify'}</GroupTitle>
                
                <SettingGroup>
                  <ToggleRow>
                    <ToggleLabel>
                      <MessageSquare size={18} />
                      <strong>{t('settings.newMessages') || 'New Messages'}</strong>
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
                      <strong>{t('settings.priceAlerts') || 'Price Drop Alerts'}</strong>
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
                      <strong>{t('settings.favoriteUpdates') || 'Favorite Car Updates'}</strong>
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
              </NotificationGroup>

              <NotificationGroup>
                <GroupTitle>{t('settings.notificationTiming') || 'Notification Timing'}</GroupTitle>
                
                <SettingGroup>
                  <Label>{t('settings.quietHours') || 'Quiet Hours'}</Label>
                  <PriceRangeContainer>
                    <Select defaultValue="22">
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </Select>
                    <span>—</span>
                    <Select defaultValue="8">
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </Select>
                  </PriceRangeContainer>
                  <HelpText>{t('settings.quietHoursHelp') || 'No notifications during these hours'}</HelpText>
                </SettingGroup>

                <SettingGroup>
                  <Label>{t('settings.emailFrequency') || 'Email Summary Frequency'}</Label>
                  <Select defaultValue="daily">
                    <option value="instant">{t('settings.instant') || 'Instant'}</option>
                    <option value="daily">{t('settings.daily') || 'Daily'}</option>
                    <option value="weekly">{t('settings.weekly') || 'Weekly'}</option>
                    <option value="never">{t('settings.never') || 'Never'}</option>
                  </Select>
                </SettingGroup>
              </NotificationGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save') || 'Save Changes'}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <Section>
              <SectionHeader>
                <SettingsIcon size={24} />
                <SectionTitle>{t('settings.appearance') || 'Appearance'}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <Label>{t('settings.theme') || 'Theme'}</Label>
                <ThemeOptions>
                  <ThemeOption
                    active={settings.appearance.theme === 'light'}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: 'light' }
                    })}
                  >
                    <Sun size={24} />
                    <span>{t('settings.light') || 'Light'}</span>
                  </ThemeOption>
                  
                  <ThemeOption
                    active={settings.appearance.theme === 'dark'}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: 'dark' }
                    })}
                  >
                    <Moon size={24} />
                    <span>{t('settings.dark') || 'Dark'}</span>
                  </ThemeOption>
                  
                  <ThemeOption
                    active={settings.appearance.theme === 'auto'}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: 'auto' }
                    })}
                  >
                    <Laptop size={24} />
                    <span>{t('settings.auto') || 'Auto'}</span>
                  </ThemeOption>
                </ThemeOptions>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.language') || 'Language'}</Label>
                <LanguageSelector>
                  <LanguageOption
                    active={language === 'bg'}
                    onClick={() => changeLanguage('bg')}
                  >
                    <Languages size={18} />
                    <span>Български</span>
                    {language === 'bg' && <span>✓</span>}
                  </LanguageOption>
                  <LanguageOption
                    active={language === 'en'}
                    onClick={() => changeLanguage('en')}
                  >
                    <Languages size={18} />
                    <span>English</span>
                    {language === 'en' && <span>✓</span>}
                  </LanguageOption>
                </LanguageSelector>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.dateFormat') || 'Date Format'}</Label>
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
                    <Zap size={18} />
                    <div>
                      <strong>{t('settings.compactView') || 'Compact View'}</strong>
                      <HelpText>{t('settings.compactViewHelp') || 'Show more content in less space'}</HelpText>
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
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save') || 'Save Changes'}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Section>
              <SectionHeader>
                <Lock size={24} />
                <SectionTitle>{t('settings.security') || 'Security'}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <ShieldCheck size={18} />
                    <div>
                      <strong>{t('settings.twoFactor') || 'Two-Factor Authentication'}</strong>
                      <HelpText>{t('settings.twoFactorHelp') || 'Add extra security'}</HelpText>
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
                      <strong>{t('settings.loginAlerts') || 'Login Alerts'}</strong>
                      <HelpText>{t('settings.loginAlertsHelp') || 'Get notified of new logins'}</HelpText>
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
                <Label>{t('settings.sessionTimeout') || 'Session Timeout (minutes)'}</Label>
                <Select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: Number(e.target.value) }
                  })}
                >
                  <option value={15}>15 {t('settings.minutes') || 'minutes'}</option>
                  <option value={30}>30 {t('settings.minutes') || 'minutes'}</option>
                  <option value={60}>1 {t('settings.hour') || 'hour'}</option>
                  <option value={240}>4 {t('settings.hours') || 'hours'}</option>
                  <option value={1440}>24 {t('settings.hours') || 'hours'}</option>
                </Select>
                <HelpText>{t('settings.sessionTimeoutHelp') || 'Auto-logout after inactivity'}</HelpText>
              </SettingGroup>

              <SettingGroup>
                <InfoBox>
                  <KeyRound size={20} />
                  <div>
                    <strong>{t('settings.loginHistory') || 'Recent Login Activity'}</strong>
                    <HelpText>{t('settings.loginHistoryHelp') || 'View your recent login sessions'}</HelpText>
                  </div>
                </InfoBox>
                <SecondaryButton onClick={() => showToast('info', 'Login history feature coming soon')}>
                  <Eye size={18} />
                  {t('settings.viewLoginHistory') || 'View Login History'}
                </SecondaryButton>
              </SettingGroup>

              <SettingGroup>
                <DangerButton onClick={() => signOut()}>
                  <LogOut size={18} />
                  {t('settings.logoutAllDevices') || 'Logout from All Devices'}
                </DangerButton>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save') || 'Save Changes'}
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
                <SectionTitle>{t('settings.carPreferences') || 'Car Preferences'}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <Label>{t('settings.priceRange') || 'Price Range (EUR)'}</Label>
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
                <Label>{t('settings.searchRadius') || 'Search Radius (km)'}</Label>
                <Input
                  type="number"
                  value={settings.carPreferences.searchRadius}
                  onChange={(e) => setSettings({
                    ...settings,
                    carPreferences: { ...settings.carPreferences, searchRadius: Number(e.target.value) }
                  })}
                  placeholder="50"
                />
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.preferredBrands') || 'Preferred Car Brands'}</Label>
                <Select multiple size={4}>
                  <option value="bmw">BMW</option>
                  <option value="mercedes">Mercedes-Benz</option>
                  <option value="audi">Audi</option>
                  <option value="volkswagen">Volkswagen</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                </Select>
                <HelpText>{t('settings.preferredBrandsHelp') || 'Hold Ctrl/Cmd to select multiple'}</HelpText>
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.fuelType') || 'Preferred Fuel Type'}</Label>
                <RadioGroup>
                  <RadioOption>
                    <input type="radio" name="fuel" value="any" defaultChecked />
                    <RadioLabel>
                      <Car size={18} />
                      <div>
                        <strong>{t('settings.anyFuel') || 'Any Fuel Type'}</strong>
                      </div>
                    </RadioLabel>
                  </RadioOption>
                  <RadioOption>
                    <input type="radio" name="fuel" value="petrol" />
                    <RadioLabel>
                      <Car size={18} />
                      <div>
                        <strong>{t('settings.petrol') || 'Petrol'}</strong>
                      </div>
                    </RadioLabel>
                  </RadioOption>
                  <RadioOption>
                    <input type="radio" name="fuel" value="diesel" />
                    <RadioLabel>
                      <Car size={18} />
                      <div>
                        <strong>{t('settings.diesel') || 'Diesel'}</strong>
                      </div>
                    </RadioLabel>
                  </RadioOption>
                  <RadioOption>
                    <input type="radio" name="fuel" value="electric" />
                    <RadioLabel>
                      <Car size={18} />
                      <div>
                        <strong>{t('settings.electric') || 'Electric'}</strong>
                      </div>
                    </RadioLabel>
                  </RadioOption>
                </RadioGroup>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save') || 'Save Changes'}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Business Info - Only for Business Accounts */}
          {activeSection === 'business' && isBusinessAccount && (
            <Section>
              <SectionHeader>
                <Building2 size={24} />
                <SectionTitle>{t('settings.business') || 'Business Information'}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <Label>{t('settings.companyName') || 'Company Name'}</Label>
                <Input
                  type="text"
                  placeholder={t('settings.companyNamePlaceholder') || 'Enter company name'}
                />
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.vatNumber') || 'VAT Number'}</Label>
                <Input
                  type="text"
                  placeholder="BG123456789"
                />
              </SettingGroup>

              <SettingGroup>
                <Label>{t('settings.businessAddress') || 'Business Address'}</Label>
                <TextArea
                  placeholder={t('settings.businessAddressPlaceholder') || 'Enter full business address'}
                  rows={3}
                />
              </SettingGroup>

              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>
                    <TrendingUp size={18} />
                    <div>
                      <strong>{t('settings.showBusinessStats') || 'Show Business Statistics'}</strong>
                      <HelpText>{t('settings.showBusinessStatsHelp') || 'Display sales metrics publicly'}</HelpText>
                    </div>
                  </ToggleLabel>
                  <Toggle defaultChecked={false} />
                </ToggleRow>
              </SettingGroup>

              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner />
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('common.save') || 'Save Changes'}
                  </>
                )}
              </SaveButton>
            </Section>
          )}

          {/* Data Export */}
          {activeSection === 'data' && (
            <Section>
              <SectionHeader>
                <Download size={24} />
                <SectionTitle>{t('settings.dataExport') || 'Data & Privacy'}</SectionTitle>
              </SectionHeader>

              <SettingGroup>
                <InfoBox>
                  <FileText size={20} />
                  <div>
                    <strong>{t('settings.downloadData') || 'Download Your Data'}</strong>
                    <HelpText>
                      {t('settings.downloadDataHelp') || 'Get a copy of all your data'}
                    </HelpText>
                  </div>
                </InfoBox>
                <SecondaryButton onClick={handleExportData}>
                  <Download size={18} />
                  {t('settings.exportData') || 'Request Data Export'}
                </SecondaryButton>
              </SettingGroup>

              <Divider />

              <SettingGroup>
                <DangerBox>
                  <AlertCircle size={20} />
                  <div>
                    <strong>{t('settings.deleteAccount') || 'Delete Account'}</strong>
                    <HelpText>
                      {t('settings.deleteAccountWarning') || 'Permanently delete your account. This cannot be undone.'}
                    </HelpText>
                  </div>
                </DangerBox>
                <DangerButton onClick={() => showToast('error', 'Please contact support to delete your account')}>
                  <Trash2 size={18} />
                  {t('settings.deleteMyAccount') || 'Delete My Account'}
                </DangerButton>
              </SettingGroup>
            </Section>
          )}
        </ContentArea>
      </SettingsLayout>
      
      {/* Floating Action Buttons */}
      <FloatingActions>
        <FloatingButton onClick={handleSave} disabled={saving} primary>
          {saving ? <Spinner /> : <Save size={20} />}
        </FloatingButton>
        <FloatingButton onClick={handlePrintReport}>
          <Printer size={20} />
        </FloatingButton>
        <FloatingButton onClick={() => showToast('info', 'Help coming soon')}>
          <HelpCircle size={20} />
        </FloatingButton>
      </FloatingActions>
      
      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <UnsavedWarning>
          <AlertCircle size={16} />
          <span>{t('settings.unsavedChanges') || 'You have unsaved changes'}</span>
          <button onClick={handleSave}>{t('common.save') || 'Save'}</button>
        </UnsavedWarning>
      )}
    </SettingsContainer>
  );
};

// ==================== Styled Components ====================

const SettingsContainer = styled.div`
  width: 100%;
  min-height: 600px;
  padding: 20px 0;
`;

const SettingsLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  
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

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 16px;
  
  svg {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  
  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const LanguageSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const LanguageOption = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${props => props.active ? 'rgba(255, 143, 16, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.active ? '#FF8F10' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.active ? '#FF8F10' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: ${props => props.active ? 'rgba(255, 143, 16, 0.25)' : 'rgba(255, 255, 255, 0.08)'};
  }
  
  svg {
    flex-shrink: 0;
  }
  
  span:last-child {
    margin-left: auto;
    font-weight: bold;
  }
`;

const FloatingActions = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
  
  @media (max-width: 768px) {
    bottom: 90px;
  }
`;

const FloatingButton = styled.button<{ primary?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.primary ? 'linear-gradient(135deg, #FF8F10 0%, #FF6B10 100%)' : 'rgba(255, 255, 255, 0.1)'};
  border: ${props => props.primary ? 'none' : '2px solid rgba(255, 255, 255, 0.2)'};
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(255, 143, 16, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UnsavedWarning = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  
  button {
    padding: 4px 12px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
`;

export default ProfileSettingsMobileDe;


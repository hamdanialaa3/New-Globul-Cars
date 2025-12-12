import { logger } from '../../../../../services/logger-service';
// ProfilePage/tabs/SettingsTab.tsx
// ✅ TESTING VERSION - COMPREHENSIVE SETTINGS PAGE
// Version: 2.0 - November 9, 2025 - 3:00 PM

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useAuth } from '../../../../../contexts/AuthProvider';
import { useTheme } from '../../../../../contexts/ThemeContext';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import { isDealerProfile } from '../../../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';
import DealershipInfoForm from '../../../../../components/Profile/Dealership/DealershipInfoForm';
import { 
  CreditCard, Edit, User, MapPin, Phone, Mail, Save, 
  Shield, Bell, Settings as SettingsIcon, Lock, Download, 
  Building2, Globe, Car, Trash2, AlertCircle, FileText,
  Eye, MessageSquare, TrendingUp, Smartphone, DollarSign,
  Heart, Sun, Moon, Laptop, ShieldCheck, KeyRound, LogOut,
  Camera, X
} from 'lucide-react';
import { IDCardOverlay, IDCardData } from '../../../../../components/Profile/IDCardEditor';
import ProfileImageUploader from '../../../../../components/Profile/ProfileImageUploader';
import { ProfileService } from '../../../../../services/profile/ProfileService';
import { unifiedCarService } from '../../../../../services/car/unified-car.service';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../../../../../firebase/firebase-config';
import { toast } from 'react-toastify';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

interface SettingsTabProps {
  user: BulgarianUser | null;
  theme: ProfileTheme;
  refresh?: () => Promise<void>;
  setUser?: React.Dispatch<React.SetStateAction<BulgarianUser | null>>;
}

// Main Settings Tab Component
export const SettingsTab: React.FC<SettingsTabProps> = ({ user, theme, refresh, setUser }) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { theme: appTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDark = appTheme === 'dark';
  
  // Get active section from URL or default to 'editInfo'
  const sectionFromUrl = searchParams.get('section') || 'editInfo';
  const [activeSection, setActiveSection] = useState<string>(sectionFromUrl);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Update URL when section changes
  useEffect(() => {
    if (sectionFromUrl !== activeSection) {
      setSearchParams({ section: activeSection }, { replace: true });
    }
  }, [activeSection, sectionFromUrl, setSearchParams]);
  
  // Update active section when URL changes
  useEffect(() => {
    if (sectionFromUrl && sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);
  const [settings, setSettings] = useState<any>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    bio: user?.bio || '',
    language: user?.preferredLanguage || 'bg',
    privacy: {
      profileVisibility: 'public',
      showPhone: true,
      showEmail: false,
      showLastSeen: true,
      allowMessages: true,
      showActivity: true
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      newMessages: true,
      priceAlerts: true,
      favoriteUpdates: true,
      newListings: true,
      promotions: false,
      newsletter: false
    },
    appearance: {
      theme: 'auto',
      currency: 'EUR',
      dateFormat: 'dd/mm/yyyy',
      compactView: false
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30
    },
    carPreferences: {
      priceRange: {
        min: 0,
        max: 100000
      },
      searchRadius: 50
    }
  });

  const isBusinessAccount = user?.profileType === 'dealer' || user?.profileType === 'company';

  // Load user settings on mount
  React.useEffect(() => {
    if (user) {
      setSettings({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        bio: user.bio || '',
        language: user.preferredLanguage || 'bg',
        privacy: {
          profileVisibility: (user as any).privacy?.profileVisibility || 'public',
          showPhone: (user as any).privacy?.showPhone !== false,
          showEmail: (user as any).privacy?.showEmail === true,
          showLastSeen: (user as any).privacy?.showLastSeen !== false,
          allowMessages: (user as any).privacy?.allowMessages !== false,
          showActivity: (user as any).privacy?.showActivity !== false
        },
        notifications: {
          email: (user as any).notifications?.email !== false,
          sms: (user as any).notifications?.sms === true,
          push: (user as any).notifications?.push !== false,
          newMessages: (user as any).notifications?.newMessages !== false,
          priceAlerts: (user as any).notifications?.priceAlerts !== false,
          favoriteUpdates: (user as any).notifications?.favoriteUpdates !== false,
          newListings: (user as any).notifications?.newListings !== false,
          promotions: (user as any).notifications?.promotions === true,
          newsletter: (user as any).notifications?.newsletter === true
        },
        appearance: {
          theme: (user as any).appearance?.theme || 'auto',
          currency: (user as any).appearance?.currency || 'EUR',
          dateFormat: (user as any).appearance?.dateFormat || 'dd/mm/yyyy',
          compactView: (user as any).appearance?.compactView === true
        },
        security: {
          twoFactorEnabled: (user as any).security?.twoFactorEnabled === true,
          loginAlerts: (user as any).security?.loginAlerts !== false,
          sessionTimeout: (user as any).security?.sessionTimeout || 30
        },
        carPreferences: {
          priceRange: {
            min: (user as any).carPreferences?.priceRange?.min || 0,
            max: (user as any).carPreferences?.priceRange?.max || 100000
          },
          searchRadius: (user as any).carPreferences?.searchRadius || 50
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!currentUser?.uid) {
      toast.error(t('settings.saveError', 'Error saving settings'));
      return;
    }

    try {
      setSaving(true);
      await ProfileService.updateUserProfile(currentUser.uid, {
        displayName: settings.displayName,
        phoneNumber: settings.phone,
        bio: settings.bio,
        preferredLanguage: settings.language
      });
      
      toast.success(t('settings.saveSuccess', 'Settings saved successfully'));
    } catch (error) {
      logger.error('Error saving settings:', error);
      toast.error(t('settings.saveError', 'Error saving settings'));
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error(language === 'bg' ? 'Моля попълнете всички полета' : 'Please fill all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('settings.passwordTooShort', 'Password must be at least 6 characters'));
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      toast.error(language === 'bg' ? 'Грешка при удостоверяване' : 'Authentication error');
      return;
    }

    try {
      setChangingPassword(true);

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);

      // Success
      toast.success(t('settings.passwordChanged', 'Password changed successfully'));
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error: any) {
      logger.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error(t('settings.wrongPassword', 'Wrong current password'));
      } else if (error.code === 'auth/weak-password') {
        toast.error(t('settings.passwordTooShort', 'Password must be at least 6 characters'));
      } else {
        toast.error(language === 'bg' ? 'Грешка при смяна на паролата' : 'Error changing password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Export user data to JSON/CSV file
  const handleExportData = async () => {
    if (!currentUser?.uid || !user) {
      toast.error(t('settings.exportError', 'Error exporting data'));
      return;
    }

    try {
      setSaving(true);
      toast.info(language === 'bg' ? 'Събиране на данни...' : 'Collecting data...', { autoClose: 2000 });

      // Fetch user's car listings
      const userCars = await unifiedCarService.searchCars({ sellerId: currentUser.uid }, 1000);

      // Prepare user data
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          uid: user.uid,
          displayName: user.displayName || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          profileType: user.profileType || 'private',
          location: user.location || {},
          bio: user.bio || '',
          preferredLanguage: user.preferredLanguage || 'bg',
          createdAt: user.createdAt?.toDate?.()?.toISOString() || user.createdAt || '',
          idCardData: (user as any).idCardData || null
        },
        settings: {
          privacy: settings.privacy || {},
          notifications: settings.notifications || {},
          appearance: settings.appearance || {},
          security: settings.security || {},
          carPreferences: settings.carPreferences || {}
        },
        listings: userCars.map(car => ({
          id: car.id,
          make: car.make || '',
          model: car.model || '',
          year: car.year || 0,
          price: car.price || 0,
          mileage: car.mileage || 0,
          fuelType: car.fuelType || '',
          transmission: car.transmission || '',
          status: car.status || 'active',
          views: car.views || 0,
          favorites: car.favorites || 0,
          createdAt: car.createdAt?.toISOString?.() || car.createdAt || '',
          updatedAt: car.updatedAt?.toISOString?.() || car.updatedAt || ''
        })),
        statistics: {
          totalListings: userCars.length,
          activeListings: userCars.filter(c => c.isActive && !c.isSold).length,
          soldListings: userCars.filter(c => c.isSold).length,
          totalViews: userCars.reduce((sum, c) => sum + (c.views || 0), 0),
          totalFavorites: userCars.reduce((sum, c) => sum + (c.favorites || 0), 0)
        }
      };

      // Create JSON file
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
      link.download = `globul-cars-user-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
      toast.success(
        language === 'bg' 
          ? '✅ Данните са изтеглени успешно!' 
          : '✅ Data exported successfully!',
        { autoClose: 3000 }
      );
    } catch (error) {
      logger.error('Error exporting data:', error);
      toast.error(
        language === 'bg' 
          ? 'Грешка при експорт на данни' 
          : 'Error exporting data',
        { autoClose: 3000 }
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.uid) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bg' ? 'Моля, изберете изображение' : 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'bg' ? 'Размерът на файла трябва да бъде по-малък от 5MB' : 'File size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Delete old photo if exists (only if it's in Firebase Storage)
      if (user?.photoURL && user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract the path from the full URL
          const urlParts = user.photoURL.split('/');
          const pathIndex = urlParts.findIndex(part => part === 'o');
          if (pathIndex !== -1 && urlParts[pathIndex + 1]) {
            const encodedPath = urlParts[pathIndex + 1].split('?')[0];
            const decodedPath = decodeURIComponent(encodedPath);
            const oldPhotoRef = ref(storage, decodedPath);
            await deleteObject(oldPhotoRef);
          }
        } catch (error) {
          // Ignore if old photo doesn't exist
          logger.warn('Could not delete old photo', error);
        }
      }

      // Upload new photo
      const photoRef = ref(storage, `profile-photos/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

      // Update user profile
      await ProfileService.updateUserProfile(currentUser.uid, {
        photoURL: photoURL
      });

      toast.success(
        language === 'bg' 
          ? '✅ Снимката е качена успешно!' 
          : '✅ Photo uploaded successfully!',
        { autoClose: 3000 }
      );

      // Reload page to show new photo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      logger.error('Error uploading photo:', error);
      toast.error(
        language === 'bg' 
          ? 'Грешка при качване на снимка' 
          : 'Error uploading photo',
        { autoClose: 3000 }
      );
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
      // Reset input
      event.target.value = '';
    }
  };

  // Handle delete profile photo
  const handleDeletePhoto = async () => {
    if (!currentUser?.uid || !user?.photoURL) return;

    const confirmMessage = language === 'bg'
      ? 'Наистина ли искате да изтриете профилната си снимка?'
      : 'Are you sure you want to delete your profile photo?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setUploadingPhoto(true);

      // Delete from storage (only if it's in Firebase Storage)
      if (user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract the path from the full URL
          const urlParts = user.photoURL.split('/');
          const pathIndex = urlParts.findIndex(part => part === 'o');
          if (pathIndex !== -1 && urlParts[pathIndex + 1]) {
            const encodedPath = urlParts[pathIndex + 1].split('?')[0];
            const decodedPath = decodeURIComponent(encodedPath);
            const photoRef = ref(storage, decodedPath);
            await deleteObject(photoRef);
        }
      } catch (error) {
          // Log but continue - might be external URL
          logger.warn('Could not delete photo from storage', error);
        }
      }

      // Update user profile
      await ProfileService.updateUserProfile(currentUser.uid, {
        photoURL: undefined
      } as any);

      toast.success(
        language === 'bg' 
          ? '✅ Снимката е изтрита успешно!' 
          : '✅ Photo deleted successfully!',
        { autoClose: 3000 }
      );

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      logger.error('Error deleting photo:', error);
      toast.error(
        language === 'bg' 
          ? 'Грешка при изтриване на снимка' 
          : 'Error deleting photo',
        { autoClose: 3000 }
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!currentUser?.uid) return;

    const confirmMessage = language === 'bg'
      ? 'Наистина ли искате да изтриете акаунта си? Това действие е необратимо!'
      : 'Are you sure you want to delete your account? This action is irreversible!';

    if (!window.confirm(confirmMessage)) return;

    try {
      setSaving(true);
      // TODO: Implement account deletion logic
      toast.info(
        language === 'bg' 
          ? 'Функцията за изтриване на акаунт е в процес на разработка' 
          : 'Account deletion feature is under development',
        { autoClose: 3000 }
      );
    } catch (error) {
      logger.error('Error deleting account:', error);
      toast.error(
        language === 'bg' 
          ? 'Грешка при изтриване на акаунта' 
          : 'Error deleting account',
        { autoClose: 3000 }
      );
    } finally {
      setSaving(false);
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
    { id: 'editInfo', icon: Edit, label: language === 'bg' ? 'Редактиране на информация' : 'Edit Information' },
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
        <Sidebar $isDark={isDark}>
          {/* Profile Photo Section - Using same ProfileImageUploader as main profile page */}
          <AvatarSection $isDark={isDark}>
            <ProfileImageUploader
              currentImageUrl={typeof user?.photoURL === 'string' ? user.photoURL : (typeof user?.profileImage === 'object' ? user.profileImage?.url : undefined)}
              onUploadSuccess={(url) => {
                // Update local state immediately if setUser is available
                if (setUser) {
                  setUser(prev => prev ? { 
                    ...prev, 
                    photoURL: url,
                    profileImage: url ? { url, uploadedAt: new Date() } : undefined
                  } : null);
                }
                // Refresh profile data if refresh is available
                if (refresh) {
                  refresh();
                } else {
                  // Fallback: reload page
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                }
              }}
              onUploadError={(err) => {
                logger.error('Profile image upload error in settings', err as Error);
                toast.error(
                  language === 'bg' ? `Грешка при качване: ${err}` : `Upload error: ${err}`,
                  { autoClose: 3000 }
                );
              }}
            />
            <AvatarName $isDark={isDark}>{user?.displayName || 'User'}</AvatarName>
            <AvatarEmail $isDark={isDark}>{user?.email || ''}</AvatarEmail>
          </AvatarSection>

          <SidebarTitle $isDark={isDark}>{t('settings.title', 'Settings')}</SidebarTitle>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <SidebarItem
                key={section.id}
                $active={activeSection === section.id}
                $isDark={isDark}
                onClick={() => {
                  setActiveSection(section.id);
                  setSearchParams({ section: section.id }, { replace: true });
                }}
              >
                <Icon size={20} />
                <span>{section.label}</span>
              </SidebarItem>
            );
          })}
        </Sidebar>

        {/* Main Content Area */}
        <ContentArea $isDark={isDark}>
          {/* Edit Information Section */}
          {activeSection === 'editInfo' && (
            <EditInformationSection user={user} language={language} />
          )}

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
                {!showPasswordChange ? (
                  <DangerButton onClick={() => setShowPasswordChange(true)}>
                    <KeyRound size={18} />
                    {t('settings.changePassword', 'Change Password')}
                  </DangerButton>
                ) : (
                  <PasswordChangeForm>
                    <PasswordFormTitle>
                      <KeyRound size={20} />
                      {t('settings.changePassword', 'Change Password')}
                    </PasswordFormTitle>
                    
                    <PasswordField>
                      <Label>{t('settings.currentPassword', 'Current Password')}</Label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                    </PasswordField>

                    <PasswordField>
                      <Label>{t('settings.newPassword', 'New Password')}</Label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                    </PasswordField>

                    <PasswordField>
                      <Label>{t('settings.confirmPassword', 'Confirm Password')}</Label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                    </PasswordField>

                    <PasswordButtonGroup>
                      <CancelButton 
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        disabled={changingPassword}
                      >
                        {language === 'bg' ? 'Отказ' : 'Cancel'}
                      </CancelButton>
                      <SavePasswordButton 
                        onClick={handlePasswordChange}
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          language === 'bg' ? 'Смяна...' : 'Changing...'
                        ) : (
                          language === 'bg' ? 'Смени паролата' : 'Change Password'
                        )}
                      </SavePasswordButton>
                    </PasswordButtonGroup>
                  </PasswordChangeForm>
                )}
              </SettingGroup>

              <SettingGroup>
                <DangerButton onClick={async () => {
                  if (window.confirm(language === 'bg' 
                    ? 'Наистина ли искате да излезете от всички устройства?' 
                    : 'Are you sure you want to logout from all devices?')) {
                    try {
                      // TODO: Implement logout from all devices
                      toast.info(
                        language === 'bg' 
                          ? 'Функцията е в процес на разработка' 
                          : 'Feature is under development',
                        { autoClose: 3000 }
                      );
                    } catch (error) {
                      logger.error('Error logging out:', error);
                      toast.error(
                        language === 'bg' 
                          ? 'Грешка при излизане' 
                          : 'Error logging out',
                        { autoClose: 3000 }
                      );
                    }
                  }
                }}>
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

const Sidebar = styled.div<{ $isDark?: boolean }>`
  background: ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  border: ${props => props.$isDark ? '1px solid var(--border-primary)' : '1px solid var(--border-primary)'};
  border-radius: 16px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
  box-shadow: var(--shadow-card);
  
  @media (max-width: 968px) {
    position: static;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px;
  }
`;

const AvatarSection = styled.div<{ $isDark?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 24px;
  border-bottom: 2px solid ${props => props.$isDark ? 'var(--border-primary)' : 'var(--border-primary)'};
  
  /* Style for ProfileImageUploader inside */
  > div {
    margin-bottom: 12px;
  }
  
  @media (max-width: 968px) {
    padding: 16px 0;
    margin-bottom: 16px;
  }
`;

const AvatarContainer = styled.div<{ $isDark?: boolean }>`
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 12px;
  
  @media (max-width: 968px) {
    width: 100px;
    height: 100px;
  }
`;

const AvatarImage = styled.img<{ $isDark?: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${props => props.$isDark ? 'var(--accent-primary)' : 'var(--accent-primary)'};
  box-shadow: ${props => props.$isDark ? 'var(--shadow-md)' : 'var(--shadow-md)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const UploadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const AvatarEditButton = styled.button<{ $isDark?: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  max-width: 36px;
  max-height: 36px;
  border-radius: 50%;
  background: ${props => props.$isDark ? 'var(--accent-primary)' : 'var(--accent-primary)'};
  color: white;
  border: 3px solid ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  overflow: hidden;
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.$isDark ? 'var(--accent-secondary)' : 'var(--accent-secondary)'};
    transform: scale(1.1);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 968px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    max-width: 32px;
    max-height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const AvatarDeleteButton = styled.button<{ $isDark?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  max-width: 28px;
  max-height: 28px;
  border-radius: 50%;
  background: ${props => props.$isDark ? 'var(--error)' : 'var(--error)'};
  color: white;
  border: 2px solid ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  overflow: hidden;
  
  svg {
    width: 14px;
    height: 14px;
    stroke-width: 3;
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${props => props.$isDark ? '#dc2626' : '#dc2626'};
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 968px) {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    max-width: 24px;
    max-height: 24px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const AvatarName = styled.div<{ $isDark?: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.$isDark ? 'var(--text-primary)' : 'var(--text-primary)'};
  margin-bottom: 4px;
  text-align: center;
  word-break: break-word;
  
  @media (max-width: 968px) {
    font-size: 1rem;
  }
`;

const AvatarEmail = styled.div<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? 'var(--text-secondary)' : 'var(--text-secondary)'};
  text-align: center;
  word-break: break-word;
  opacity: 0.8;
  
  @media (max-width: 968px) {
    font-size: 0.8125rem;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const SidebarTitle = styled.h2<{ $isDark?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$isDark ? 'var(--text-primary)' : 'var(--text-primary)'};
  margin: 0 0 20px 0;
  
  @media (max-width: 968px) {
    width: 100%;
    font-size: 1.25rem;
    margin-bottom: 12px;
  }
`;

const SidebarItem = styled.button<{ $active?: boolean; $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$active 
    ? (props.$isDark ? 'rgba(255, 140, 97, 0.2)' : 'rgba(255, 107, 53, 0.15)')
    : 'transparent'};
  border: 2px solid ${props => props.$active 
    ? (props.$isDark ? 'var(--accent-primary)' : 'var(--accent-primary)')
    : 'transparent'};
  border-radius: 12px;
  color: ${props => props.$active 
    ? 'var(--accent-primary)'
    : (props.$isDark ? 'var(--text-secondary)' : 'var(--text-primary)')};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;

  &:hover {
    background: ${props => props.$active 
      ? (props.$isDark ? 'rgba(255, 140, 97, 0.25)' : 'rgba(255, 107, 53, 0.2)')
      : (props.$isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)')};
    transform: translateX(4px);
    color: var(--accent-primary);
  }

  svg {
    flex-shrink: 0;
    color: ${props => {
      if (props.$active) return 'var(--accent-primary)';
      if (props.$isDark) return 'var(--text-secondary)';
      // في الوضع النهاري: استخدم لون أغمق للأيقونات
      return '#2D3748'; // رمادي داكن للوضوح
    }};
    transition: color 0.2s ease;
    stroke-width: ${props => props.$active ? 2.5 : 2};
  }
  
  &:hover svg {
    color: var(--accent-primary);
    stroke-width: 2.5;
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

const ContentArea = styled.div<{ $isDark?: boolean }>`
  background: ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-card)'};
  border: ${props => props.$isDark ? '1px solid var(--border-primary)' : '1px solid var(--border-primary)'};
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-card);
  
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

const Label = styled.label<{ $required?: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: #ef4444;
      margin-left: 4px;
    }
  `}
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

const PasswordChangeForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  width: 100%;
`;

const PasswordFormTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const PasswordField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PasswordButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--bg-hover);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SavePasswordButton = styled.button`
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

// ==================== EDIT INFORMATION SECTION ====================

interface EditInformationSectionProps {
  user: BulgarianUser | null;
  language: string;
}

const EditInformationSection: React.FC<EditInformationSectionProps> = ({ user, language }) => {
  const { currentUser } = useAuth();
  const [showIDEditor, setShowIDEditor] = useState(false);
  const [userInfo, setUserInfo] = useState({
    displayName: user?.displayName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    city: user?.location?.city || '',
    region: user?.location?.region || '',
    address: user?.location?.city || '',
    bio: user?.bio || ''
  });
  const [saving, setSaving] = useState(false);
  const [idCardData, setIdCardData] = useState<Partial<IDCardData>>({});

  // Load ID card data from user if exists
  React.useEffect(() => {
    if (user && (user as any).idCardData) {
      setIdCardData((user as any).idCardData);
    }
  }, [user]);

  const handleSaveUserInfo = async () => {
    if (!currentUser?.uid) return;
    
    setSaving(true);
    try {
      await ProfileService.updateUserProfile(currentUser.uid, {
        displayName: userInfo.displayName,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phoneNumber: userInfo.phoneNumber,
        location: {
          city: userInfo.city,
          region: userInfo.region,
          country: 'Bulgaria'
        },
        bio: userInfo.bio
      });
      
      toast.success(
        language === 'bg' 
          ? 'Информацията е запазена успешно!' 
          : 'Information saved successfully!',
        { autoClose: 3000 }
      );
    } catch (error) {
      toast.error(
        language === 'bg' 
          ? 'Грешка при запазване на информацията' 
          : 'Error saving information',
        { autoClose: 3000 }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIDCard = async (data: IDCardData) => {
    if (!currentUser?.uid) return;
    
    setSaving(true);
    try {
      // Save ID card data to user profile
      await ProfileService.updateUserProfile(currentUser.uid, {
        idCardData: data,
        // Auto-fill user info from ID card if empty
        firstName: userInfo.firstName || data.firstNameBG || data.firstNameEN,
        lastName: userInfo.lastName || data.lastNameBG || data.lastNameEN,
        displayName: userInfo.displayName || `${data.firstNameBG || data.firstNameEN} ${data.lastNameBG || data.lastNameEN}`.trim()
      } as any);
      
      setIdCardData(data);
      setShowIDEditor(false);
      
      toast.success(
        language === 'bg' 
          ? 'Данните от личната карта са запазени!' 
          : 'ID card data saved successfully!',
        { autoClose: 3000 }
      );
    } catch (error) {
      toast.error(
        language === 'bg' 
          ? 'Грешка при запазване на данните от личната карта' 
          : 'Error saving ID card data',
        { autoClose: 3000 }
      );
    } finally {
      setSaving(false);
    }
  };

  const isBg = language === 'bg';

  return (
    <Section>
      <SectionHeader>
        <Edit size={24} />
        <SectionTitle>
          {isBg ? 'Редактиране на информация' : 'Edit Information'}
        </SectionTitle>
      </SectionHeader>

      {/* ID Card Section */}
      <IDCardSection>
        <IDCardHeader>
          <div>
            <IDCardTitle>
              {isBg ? '🆔 Лична карта' : '🆔 ID Card'}
            </IDCardTitle>
            <IDCardSubtitle>
              {isBg 
                ? 'Попълнете данните от личната си карта за автоматично попълване' 
                : 'Fill in your ID card data for automatic form filling'}
            </IDCardSubtitle>
          </div>
          <IDCardButton onClick={() => setShowIDEditor(true)}>
            <CreditCard size={18} />
            {isBg ? 'Редактирай лична карта' : 'Edit ID Card'}
          </IDCardButton>
        </IDCardHeader>
        
        {idCardData.documentNumber && (
          <IDCardInfo>
            <InfoItem>
              <strong>{isBg ? '№ на документа:' : 'Document No.:'}</strong> {idCardData.documentNumber}
            </InfoItem>
            <InfoItem>
              <strong>{isBg ? 'ЕГН:' : 'EGN:'}</strong> {idCardData.personalNumber}
            </InfoItem>
            {(idCardData.firstNameBG || idCardData.firstNameEN) && (
              <InfoItem>
                <strong>{isBg ? 'Име:' : 'Name:'}</strong> {idCardData.firstNameBG || idCardData.firstNameEN} {idCardData.lastNameBG || idCardData.lastNameEN}
              </InfoItem>
            )}
          </IDCardInfo>
        )}
      </IDCardSection>

      {/* Personal Information Form */}
      <FormSection>
        <FormTitle>
          {isBg ? 'Лична информация' : 'Personal Information'}
        </FormTitle>

        <SettingGroup>
          <Label $required>{isBg ? 'Име за показване' : 'Display Name'}</Label>
          <Input
            type="text"
            value={userInfo.displayName}
            onChange={(e) => setUserInfo({ ...userInfo, displayName: e.target.value })}
            placeholder={isBg ? 'Вашето име' : 'Your name'}
          />
        </SettingGroup>

        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Име' : 'First Name'}</Label>
            <Input
              type="text"
              value={userInfo.firstName}
              onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
              placeholder={isBg ? 'Име' : 'First name'}
            />
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Фамилия' : 'Last Name'}</Label>
            <Input
              type="text"
              value={userInfo.lastName}
              onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
              placeholder={isBg ? 'Фамилия' : 'Last name'}
            />
          </SettingGroup>
        </FormRow>

        <SettingGroup>
          <Label $required>
            <Mail size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Имейл' : 'Email'}
          </Label>
          <Input
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            placeholder="example@email.com"
            disabled
          />
          <HelpText>{isBg ? 'Имейлът не може да бъде променен' : 'Email cannot be changed'}</HelpText>
        </SettingGroup>

        <SettingGroup>
          <Label>
            <Phone size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Телефон' : 'Phone Number'}
          </Label>
          <Input
            type="tel"
            value={userInfo.phoneNumber}
            onChange={(e) => setUserInfo({ ...userInfo, phoneNumber: e.target.value })}
            placeholder="+359 888 123 456"
          />
        </SettingGroup>

        <FormTitle style={{ marginTop: '2rem' }}>
          {isBg ? 'Местоположение' : 'Location'}
        </FormTitle>

        <FormRow>
          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Област' : 'Region'}</Label>
            <Input
              type="text"
              value={userInfo.region}
              onChange={(e) => setUserInfo({ ...userInfo, region: e.target.value })}
              placeholder={isBg ? 'Област' : 'Region'}
            />
          </SettingGroup>

          <SettingGroup style={{ flex: 1 }}>
            <Label>{isBg ? 'Град' : 'City'}</Label>
            <Input
              type="text"
              value={userInfo.city}
              onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
              placeholder={isBg ? 'Град' : 'City'}
            />
          </SettingGroup>
        </FormRow>

        <SettingGroup>
          <Label>
            <MapPin size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
            {isBg ? 'Адрес' : 'Address'}
          </Label>
          <Input
            type="text"
            value={userInfo.address}
            onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
            placeholder={isBg ? 'Улица, номер' : 'Street, number'}
          />
        </SettingGroup>

        <SettingGroup>
          <Label>{isBg ? 'Биография' : 'Bio'}</Label>
          <TextArea
            value={userInfo.bio}
            onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
            placeholder={isBg ? 'Разкажете за себе си...' : 'Tell others about yourself...'}
            rows={4}
          />
        </SettingGroup>

        <SaveButton onClick={handleSaveUserInfo} disabled={saving}>
          {saving ? (
            <>
              <Spinner />
              {isBg ? 'Запазване...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save size={18} />
              {isBg ? 'Запази промените' : 'Save Changes'}
            </>
          )}
        </SaveButton>
      </FormSection>

      {/* ID Card Editor Modal */}
      {showIDEditor && (
        <IDCardOverlay
          initialData={idCardData}
          onSave={handleSaveIDCard}
          onClose={() => setShowIDEditor(false)}
        />
      )}
    </Section>
  );
};

// Styled components for Edit Information Section
const IDCardSection = styled.div`
  background: rgba(168, 85, 247, 0.1);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
`;

const IDCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const IDCardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const IDCardSubtitle = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const IDCardButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #a855f7;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #9333ea;
    transform: translateY(-2px);
  }
`;

const IDCardInfo = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(168, 85, 247, 0.3);
`;

const InfoItem = styled.div`
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-size: 0.95rem;

  strong {
    color: #c084fc;
    margin-right: 8px;
  }
`;

const FormSection = styled.div`
  margin-top: 32px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export default SettingsTab;


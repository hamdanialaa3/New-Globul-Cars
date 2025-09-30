// src/components/ProfileManager.tsx
// Comprehensive Profile Management Component

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Settings,
  Shield,
  Bell,
  CreditCard,
  Car,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Link2,
  Unlink,
  AlertTriangle,
  CheckCircle,
  Building,
  FileText,
  Globe,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { BulgarianUserProfile, SocialAuthService } from '../firebase/social-auth-service';
import BulgarianProfileService, { DealerProfile, UserPreferences } from '../services/bulgarian-profile-service';
import { useTranslation } from '../hooks/useTranslation';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  animation: ${fadeIn} 0.6s ease-out;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ProfileImageContainer = styled.div`
  position: relative;
  
  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid ${({ theme }) => theme.colors.primary.main};
  }
  
  .upload-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    padding: ${({ theme }) => theme.spacing.sm};
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
      background: ${({ theme }) => theme.colors.primary.dark};
    }
  }
  
  .hidden-input {
    display: none;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  
  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
  }
  
  .user-details {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
  
  .dealer-badge {
    background: ${({ theme }) => theme.colors.success.main};
    color: white;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: none;
  background: none;
  color: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.text.secondary};
  font-weight: ${({ active, theme }) => active ? theme.typography.fontWeight.bold : theme.typography.fontWeight.normal};
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.colors.primary.main : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.grey[50]};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary.main};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'danger':
        return `
          background: ${theme.colors.error.main};
          color: white;
          &:hover { background: ${theme.colors.error.dark}; }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.grey[200]};
          color: ${theme.colors.text.primary};
          &:hover { background: ${theme.colors.grey[300]}; }
        `;
      default:
        return `
          background: ${theme.colors.primary.main};
          color: white;
          &:hover { background: ${theme.colors.primary.dark}; }
        `;
    }
  }}
`;

const SocialProviderCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AlertBox = styled.div<{ type: 'success' | 'error' | 'warning' | 'info' }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  ${({ type, theme }) => {
    switch (type) {
      case 'success':
        return `background: ${theme.colors.success.light}; color: ${theme.colors.success.dark};`;
      case 'error':
        return `background: ${theme.colors.error.light}; color: ${theme.colors.error.dark};`;
      case 'warning':
        return `background: ${theme.colors.warning.light}; color: ${theme.colors.warning.dark};`;
      default:
        return `background: ${theme.colors.info.light}; color: ${theme.colors.info.dark};`;
    }
  }}
`;

interface ProfileManagerProps {
  onClose?: () => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState<BulgarianUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    location: { city: '', region: '' }
  });
  
  const [dealerForm, setDealerForm] = useState<Partial<DealerProfile>>({
    companyName: '',
    licenseNumber: '',
    address: { street: '', city: '', postalCode: '', region: '' },
    contactInfo: { phone: '', email: '', website: '' }
  });

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    language: 'bg',
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      newMessages: true,
      priceAlerts: true,
      favoriteUpdates: true
    },
    privacy: {
      profileVisibility: 'dealers',
      showPhone: false,
      showEmail: false,
      allowMessages: true,
      allowCallbacks: true
    }
  });

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userProfile = await BulgarianProfileService.getUserProfile(currentUser.uid);
      if (userProfile) {
        setProfile(userProfile);
        setPersonalForm({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          phoneNumber: userProfile.phoneNumber || '',
          location: {
            city: userProfile.location?.city || '',
            region: userProfile.location?.region || ''
          }
        });
        if (userProfile.dealerInfo) {
          setDealerForm(userProfile.dealerInfo);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await BulgarianProfileService.updateUserProfile(currentUser.uid, {
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        displayName: `${personalForm.firstName} ${personalForm.lastName}`.trim(),
        phoneNumber: personalForm.phoneNumber,
        location: {
          city: personalForm.location.city,
          region: personalForm.location.region,
          country: 'Bulgaria'
        }
      });
      setMessage({ type: 'success', text: t('profile.updated') });
      await loadUserProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDealer = async () => {
    if (!currentUser || !dealerForm.companyName || !dealerForm.licenseNumber) return;
    
    try {
      setSaving(true);
      await BulgarianProfileService.setupDealerProfile(currentUser.uid, dealerForm as DealerProfile);
      setMessage({ type: 'success', text: 'Dealer profile updated successfully' });
      await loadUserProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await BulgarianProfileService.updatePreferences(currentUser.uid, preferences);
      setMessage({ type: 'success', text: 'Preferences updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setSaving(true);
      const photoURL = await BulgarianProfileService.uploadProfilePicture(currentUser.uid, file);
      setMessage({ type: 'success', text: 'Profile picture updated successfully' });
      await loadUserProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLinkProvider = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setSaving(true);
      await SocialAuthService.linkSocialProvider(provider);
      setMessage({ type: 'success', text: `${provider} account linked successfully` });
      await loadUserProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const renderPersonalTab = () => (
    <FormSection>
      <SectionTitle>
        <User size={20} />
        {t('profile.personalInfo')}
      </SectionTitle>
      
      <FormGrid>
        <FormGroup>
          <Label>{t('profile.firstName')}</Label>
          <Input
            value={personalForm.firstName}
            onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
            placeholder={t('profile.firstNamePlaceholder')}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>{t('profile.lastName')}</Label>
          <Input
            value={personalForm.lastName}
            onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
            placeholder={t('profile.lastNamePlaceholder')}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>{t('profile.phone')}</Label>
          <Input
            value={personalForm.phoneNumber}
            onChange={(e) => setPersonalForm({ ...personalForm, phoneNumber: e.target.value })}
            placeholder="+359..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label>{t('profile.city')}</Label>
          <Select
            value={personalForm.location.city}
            onChange={(e) => setPersonalForm({ 
              ...personalForm, 
              location: { ...personalForm.location, city: e.target.value }
            })}
          >
            <option value="">{t('profile.selectCity')}</option>
            <option value="София">София</option>
            <option value="Пловдив">Пловдив</option>
            <option value="Варна">Варна</option>
            <option value="Бургас">Бургас</option>
            <option value="Русе">Русе</option>
            <option value="Стара Загора">Стара Загора</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>{t('profile.region')}</Label>
          <Select
            value={personalForm.location.region}
            onChange={(e) => setPersonalForm({ 
              ...personalForm, 
              location: { ...personalForm.location, region: e.target.value }
            })}
          >
            <option value="">{t('profile.selectRegion')}</option>
            <option value="София-град">София-град</option>
            <option value="Пловдив">Пловдив</option>
            <option value="Варна">Варна</option>
            <option value="Бургас">Бургас</option>
            <option value="Русе">Русе</option>
          </Select>
        </FormGroup>
      </FormGrid>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button onClick={handleSavePersonal} disabled={saving}>
          <Save size={16} />
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </FormSection>
  );

  const renderDealerTab = () => (
    <FormSection>
      <SectionTitle>
        <Building size={20} />
        {t('profile.dealerInfo')}
      </SectionTitle>
      
      {!profile?.isDealer && (
        <AlertBox type="info">
          <AlertTriangle size={20} />
          {t('profile.dealerUpgradeInfo')}
        </AlertBox>
      )}
      
      <FormGrid>
        <FormGroup>
          <Label>{t('profile.companyName')}</Label>
          <Input
            value={dealerForm.companyName || ''}
            onChange={(e) => setDealerForm({ ...dealerForm, companyName: e.target.value })}
            placeholder={t('profile.companyNamePlaceholder')}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>{t('profile.licenseNumber')}</Label>
          <Input
            value={dealerForm.licenseNumber || ''}
            onChange={(e) => setDealerForm({ ...dealerForm, licenseNumber: e.target.value })}
            placeholder={t('profile.licenseNumberPlaceholder')}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>{t('profile.businessAddress')}</Label>
          <Input
            value={dealerForm.address?.street || ''}
            onChange={(e) => setDealerForm({ 
              ...dealerForm, 
              address: { ...dealerForm.address!, street: e.target.value }
            })}
            placeholder={t('profile.streetAddress')}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>{t('profile.website')}</Label>
          <Input
            value={dealerForm.contactInfo?.website || ''}
            onChange={(e) => setDealerForm({ 
              ...dealerForm, 
              contactInfo: { ...dealerForm.contactInfo!, website: e.target.value }
            })}
            placeholder="https://..."
          />
        </FormGroup>
      </FormGrid>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button onClick={handleSaveDealer} disabled={saving}>
          <Save size={16} />
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </FormSection>
  );

  const renderPreferencesTab = () => (
    <div>
      <FormSection>
        <SectionTitle>
          <Settings size={20} />
          {t('profile.generalSettings')}
        </SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>{t('profile.language')}</Label>
            <Select
              value={preferences.language || 'bg'}
              onChange={(e) => setPreferences({ 
                ...preferences, 
                language: e.target.value as 'bg' | 'en'
              })}
            >
              <option value="bg">Български</option>
              <option value="en">English</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>{t('profile.theme')}</Label>
            <Select
              value={preferences.theme || 'light'}
              onChange={(e) => setPreferences({ 
                ...preferences, 
                theme: e.target.value as 'light' | 'dark' | 'auto'
              })}
            >
              <option value="light">{t('profile.lightTheme')}</option>
              <option value="dark">{t('profile.darkTheme')}</option>
              <option value="auto">{t('profile.autoTheme')}</option>
            </Select>
          </FormGroup>
        </FormGrid>
      </FormSection>
      
      <FormSection>
        <SectionTitle>
          <Bell size={20} />
          {t('profile.notifications')}
        </SectionTitle>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(preferences.notifications || {}).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Checkbox
                checked={value}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications!,
                    [key]: e.target.checked
                  }
                })}
              />
              <Label>{t(`profile.notification.${key}`)}</Label>
            </div>
          ))}
        </div>
      </FormSection>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button onClick={handleSavePreferences} disabled={saving}>
          <Save size={16} />
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div>
      <FormSection>
        <SectionTitle>
          <Link2 size={20} />
          {t('profile.linkedAccounts')}
        </SectionTitle>
        
        <div>
          {['google', 'facebook', 'apple'].map((provider) => {
            const isLinked = profile?.linkedProviders.some(p => p.providerId === `${provider}.com`);
            return (
              <SocialProviderCard key={provider}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    background: provider === 'google' ? '#4285f4' : provider === 'facebook' ? '#1877f2' : '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {provider.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{provider.charAt(0).toUpperCase() + provider.slice(1)}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {isLinked ? t('profile.linked') : t('profile.notLinked')}
                    </div>
                  </div>
                </div>
                <Button
                  variant={isLinked ? 'secondary' : 'primary'}
                  onClick={() => isLinked ? 
                    SocialAuthService.unlinkSocialProvider(`${provider}.com`) : 
                    handleLinkProvider(provider as any)
                  }
                  disabled={saving}
                >
                  {isLinked ? <Unlink size={16} /> : <Link2 size={16} />}
                  {isLinked ? t('profile.unlink') : t('profile.link')}
                </Button>
              </SocialProviderCard>
            );
          })}
        </div>
      </FormSection>
    </div>
  );

  if (loading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>{t('common.loading')}</div>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      {message && (
        <AlertBox type={message.type}>
          {message.type === 'success' && <CheckCircle size={20} />}
          {message.type === 'error' && <AlertTriangle size={20} />}
          {message.text}
        </AlertBox>
      )}
      
      <ProfileHeader>
        <ProfileImageContainer>
          <img
            src={profile?.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="profile-image"
          />
          <div className="upload-overlay">
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden-input"
            />
          </div>
        </ProfileImageContainer>
        
        <ProfileInfo>
          <h1>
            {profile?.displayName || t('profile.unnamed')}
            {profile?.isDealer && <span className="dealer-badge">{t('profile.dealer')}</span>}
          </h1>
          <div className="user-details">
            <div className="detail-item">
              <Mail size={16} />
              {profile?.email}
            </div>
            {profile?.phoneNumber && (
              <div className="detail-item">
                <Phone size={16} />
                {profile.phoneNumber}
              </div>
            )}
            <div className="detail-item">
              <MapPin size={16} />
              {profile?.location?.city}, {profile?.location?.country}
            </div>
            <div className="detail-item">
              <Calendar size={16} />
              {t('profile.memberSince')} {profile?.createdAt && new Date(profile.createdAt).getFullYear()}
            </div>
          </div>
        </ProfileInfo>
        
        {onClose && (
          <Button variant="secondary" onClick={onClose}>
            <X size={16} />
            {t('common.close')}
          </Button>
        )}
      </ProfileHeader>

      <TabContainer>
        <Tab active={activeTab === 'personal'} onClick={() => setActiveTab('personal')}>
          <User size={16} />
          {t('profile.personal')}
        </Tab>
        <Tab active={activeTab === 'dealer'} onClick={() => setActiveTab('dealer')}>
          <Building size={16} />
          {t('profile.dealer')}
        </Tab>
        <Tab active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')}>
          <Settings size={16} />
          {t('profile.preferences')}
        </Tab>
        <Tab active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          <Shield size={16} />
          {t('profile.security')}
        </Tab>
      </TabContainer>

      <TabContent>
        {activeTab === 'personal' && renderPersonalTab()}
        {activeTab === 'dealer' && renderDealerTab()}
        {activeTab === 'preferences' && renderPreferencesTab()}
        {activeTab === 'security' && renderSecurityTab()}
      </TabContent>
    </ProfileContainer>
  );
};

export default ProfileManager;
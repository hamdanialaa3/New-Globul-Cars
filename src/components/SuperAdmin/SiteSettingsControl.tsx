import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import {
  Settings,
  Wrench,
  UserPlus,
  Upload,
  DollarSign,
  Shield,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Image,
  Search,
  Brain,
  Heart,
  Bell,
  Share2,
  TrendingUp
} from 'lucide-react';
import { siteSettingsService } from '@/services/site-settings.service';
import type { SiteSettings } from '@/services/site-settings-types';
import { DEFAULT_SITE_SETTINGS } from '@/services/site-settings-defaults';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ff8c61;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

const CategorySection = styled.div`
  margin-bottom: 32px;
  background: #1a1f2e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #2d3748;
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #374151;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #2d3748;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 70px;

  ${props => props.$active ? `
    background: #10b981;
    color: #fff;
    &:hover {
      background: #059669;
    }
  ` : `
    background: #6b7280;
    color: #fff;
    &:hover {
      background: #4b5563;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputField = styled.input`
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e5e7eb;
  font-size: 13px;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #ff8c61;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e5e7eb;
  font-size: 13px;
  width: 100%;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #ff8c61;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #2d3748;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #ef4444;
        color: #fff;
        &:hover {
          background: #dc2626;
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return `
        background: #374151;
        color: #e5e7eb;
        &:hover {
          background: #4b5563;
        }
      `;
    }
    return `
      background: #ff8c61;
      color: #0f1419;
      &:hover {
        background: #ff7a47;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$type === 'success' ? `
    background: #064e3b;
    color: #6ee7b7;
    border: 1px solid #047857;
  ` : `
    background: #7f1d1d;
    color: #fca5a5;
    border: 1px solid #b91c1c;
  `}
`;

const SiteSettingsControl: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const adminEmail = getAuth().currentUser?.email || 'unknown';

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getSiteSettings();
      setSettings(data);
    } catch (error) {
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await siteSettingsService.updateSiteSettings(settings, adminEmail);
      showMessage('success', '✅ Settings saved successfully');
    } catch (error) {
      showMessage('error', '❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('⚠️ Are you sure you want to reset all settings to default values?')) {
      return;
    }
    try {
      setSaving(true);
      await siteSettingsService.updateSiteSettings(DEFAULT_SITE_SETTINGS, adminEmail);
      setSettings(DEFAULT_SITE_SETTINGS);
      showMessage('success', '✅ Settings have been reset');
    } catch (error) {
      showMessage('error', '❌ Reset failed');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title><Settings size={24} /> Loading...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Settings size={24} />
          Site Settings
        </Title>
        <Subtitle>
          Full control over platform settings, features, limits, and pricing
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </Message>
      )}

      {/* ═══ Maintenance & Status ═══ */}
      <CategorySection>
        <CategoryTitle>
          <Wrench size={18} />
          Maintenance & Status
        </CategoryTitle>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <AlertCircle size={14} />
              Maintenance Mode
            </SettingLabel>
            <SettingDescription>
              Enable maintenance mode to hide the site from users
            </SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.maintenanceMode}
            onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
            disabled={saving}
          >
            {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        {settings.maintenanceMode && (
          <SettingRow>
            <SettingInfo>
            <SettingLabel>Maintenance Message</SettingLabel>
            <TextArea
              value={settings.maintenanceMessage}
              onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
              disabled={saving}
              placeholder="Enter the message to display to users"
              />
            </SettingInfo>
          </SettingRow>
        )}

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Shield size={14} />
              Allow admin access during maintenance
            </SettingLabel>
            <SettingDescription>
              Admins can access the site even in maintenance mode
            </SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.allowAdminAccessDuringMaintenance}
            onClick={() => updateSetting('allowAdminAccessDuringMaintenance', !settings.allowAdminAccessDuringMaintenance)}
            disabled={saving}
          >
            {settings.allowAdminAccessDuringMaintenance ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>
      </CategorySection>

      {/* ═══ Registration & Access ═══ */}
      <CategorySection>
        <CategoryTitle>
          <UserPlus size={18} />
          Registration & Access
        </CategoryTitle>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <UserPlus size={14} />
              Enable New Registration
            </SettingLabel>
            <SettingDescription>
              Allow new users to register on the platform
            </SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.registrationEnabled}
            onClick={() => updateSetting('registrationEnabled', !settings.registrationEnabled)}
            disabled={saving}
          >
            {settings.registrationEnabled ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Mail size={14} />
              Require Email Verification
            </SettingLabel>
            <SettingDescription>
              New users must verify their email
            </SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.requireEmailVerification}
            onClick={() => updateSetting('requireEmailVerification', !settings.requireEmailVerification)}
            disabled={saving}
          >
            {settings.requireEmailVerification ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Phone size={14} />
              Require Phone Verification
            </SettingLabel>
            <SettingDescription>
              New users must verify their phone number
            </SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.requirePhoneVerification}
            onClick={() => updateSetting('requirePhoneVerification', !settings.requirePhoneVerification)}
            disabled={saving}
          >
            {settings.requirePhoneVerification ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>
      </CategorySection>

      {/* ═══ Features Toggle ═══ */}
      <CategorySection>
        <CategoryTitle>
          <Star size={18} />
          Feature Toggles
        </CategoryTitle>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <MessageSquare size={14} />
              Messaging System
            </SettingLabel>
            <SettingDescription>Conversations between users and sellers</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.messaging}
            onClick={() => updateSetting('features.messaging', !settings.features.messaging)}
            disabled={saving}
          >
            {settings.features.messaging ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Star size={14} />
              Ratings & Reviews
            </SettingLabel>
            <SettingDescription>Allow users to write reviews</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.reviews}
            onClick={() => updateSetting('features.reviews', !settings.features.reviews)}
            disabled={saving}
          >
            {settings.features.reviews ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Image size={14} />
              Visual Search
            </SettingLabel>
            <SettingDescription>Search for cars by images</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.visualSearch}
            onClick={() => updateSetting('features.visualSearch', !settings.features.visualSearch)}
            disabled={saving}
          >
            {settings.features.visualSearch ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Brain size={14} />
              AI Analysis
            </SettingLabel>
            <SettingDescription>Car analysis powered by AI</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.aiAnalysis}
            onClick={() => updateSetting('features.aiAnalysis', !settings.features.aiAnalysis)}
            disabled={saving}
          >
            {settings.features.aiAnalysis ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <DollarSign size={14} />
              Price Estimation
            </SettingLabel>
            <SettingDescription>Car price estimation tool</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.priceEstimator}
            onClick={() => updateSetting('features.priceEstimator', !settings.features.priceEstimator)}
            disabled={saving}
          >
            {settings.features.priceEstimator ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <TrendingUp size={14} />
              Smart Recommendations
            </SettingLabel>
            <SettingDescription>Personalized car recommendations</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.smartRecommendations}
            onClick={() => updateSetting('features.smartRecommendations', !settings.features.smartRecommendations)}
            disabled={saving}
          >
            {settings.features.smartRecommendations ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Share2 size={14} />
              Social Sharing
            </SettingLabel>
            <SettingDescription>Share listings on social media</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.socialSharing}
            onClick={() => updateSetting('features.socialSharing', !settings.features.socialSharing)}
            disabled={saving}
          >
            {settings.features.socialSharing ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Heart size={14} />
              Favorites
            </SettingLabel>
            <SettingDescription>Add cars to favorites</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.favorites}
            onClick={() => updateSetting('features.favorites', !settings.features.favorites)}
            disabled={saving}
          >
            {settings.features.favorites ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Search size={14} />
              Comparisons
            </SettingLabel>
            <SettingDescription>Compare cars with each other</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.comparisons}
            onClick={() => updateSetting('features.comparisons', !settings.features.comparisons)}
            disabled={saving}
          >
            {settings.features.comparisons ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Bell size={14} />
              Price Drop Alerts
            </SettingLabel>
            <SettingDescription>Notifications when favorite car prices drop</SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.features.priceAlerts}
            onClick={() => updateSetting('features.priceAlerts', !settings.features.priceAlerts)}
            disabled={saving}
          >
            {settings.features.priceAlerts ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>
      </CategorySection>

      {/* ═══ Upload Limits ═══ */}
      <CategorySection>
        <CategoryTitle>
          <Upload size={18} />
          Upload Limits
        </CategoryTitle>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Max images per listing</SettingLabel>
            <SettingDescription>Number of images allowed per listing</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="1"
            max="50"
            value={settings.uploadLimits.maxImagesPerListing}
            onChange={(e) => updateSetting('uploadLimits.maxImagesPerListing', parseInt(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Max image size (MB)</SettingLabel>
            <SettingDescription>Maximum file size per image in megabytes</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="1"
            max="20"
            value={settings.uploadLimits.maxImageSizeMB}
            onChange={(e) => updateSetting('uploadLimits.maxImageSizeMB', parseInt(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Max video duration (seconds)</SettingLabel>
            <SettingDescription>Maximum uploaded video duration in seconds</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="10"
            max="300"
            value={settings.uploadLimits.maxVideoDurationSeconds}
            onChange={(e) => updateSetting('uploadLimits.maxVideoDurationSeconds', parseInt(e.target.value))}
            disabled={saving}
          />
        </SettingRow>
      </CategorySection>

      {/* ═══ Listing Limits ═══ */}
      <CategorySection>
        <CategoryTitle>
          <Shield size={18} />
          Listing Limits
        </CategoryTitle>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Free listings per user</SettingLabel>
            <SettingDescription>Free ad limit before upgrade is required</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="1"
            max="20"
            value={settings.listingLimits.freeAdsPerUser}
            onChange={(e) => updateSetting('listingLimits.freeAdsPerUser', parseInt(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Max active listings</SettingLabel>
            <SettingDescription>Maximum active listings per user</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="1"
            max="100"
            value={settings.listingLimits.maxActiveAdsPerUser}
            onChange={(e) => updateSetting('listingLimits.maxActiveAdsPerUser', parseInt(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Listing duration (days)</SettingLabel>
            <SettingDescription>Number of days a listing stays active</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="7"
            max="365"
            value={settings.listingLimits.adDurationDays}
            onChange={(e) => updateSetting('listingLimits.adDurationDays', parseInt(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Shield size={14} />
              Require Admin Approval
            </SettingLabel>
            <SettingDescription>
              New listings require admin approval before publishing
            </SettingDescription>
          </SettingInfo>
          <ToggleButton
            $active={settings.listingLimits.requireAdminApproval}
            onClick={() => updateSetting('listingLimits.requireAdminApproval', !settings.listingLimits.requireAdminApproval)}
            disabled={saving}
          >
            {settings.listingLimits.requireAdminApproval ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SettingRow>
      </CategorySection>

      {/* ═══ Pricing & Fees ═══ */}
      <CategorySection>
        <CategoryTitle>
          <DollarSign size={18} />
          Pricing & Fees
        </CategoryTitle>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Premium ad price (SAR)</SettingLabel>
            <SettingDescription>Price to upgrade a listing to premium</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="0"
            value={settings.pricing.premiumAdPrice}
            onChange={(e) => updateSetting('pricing.premiumAdPrice', parseFloat(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Featured ad price (SAR)</SettingLabel>
            <SettingDescription>Price for listing to appear in featured section</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="0"
            value={settings.pricing.featuredAdPrice}
            onChange={(e) => updateSetting('pricing.featuredAdPrice', parseFloat(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Top ad price (SAR)</SettingLabel>
            <SettingDescription>Price for listing to appear at top of search results</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="0"
            value={settings.pricing.topAdPrice}
            onChange={(e) => updateSetting('pricing.topAdPrice', parseFloat(e.target.value))}
            disabled={saving}
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>Platform commission rate (%)</SettingLabel>
            <SettingDescription>Commission on every sale</SettingDescription>
          </SettingInfo>
          <InputField
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings.pricing.platformFeePercentage}
            onChange={(e) => updateSetting('pricing.platformFeePercentage', parseFloat(e.target.value))}
            disabled={saving}
          />
        </SettingRow>
      </CategorySection>

      {/* ═══ Contact Info ═══ */}
      <CategorySection>
        <CategoryTitle>
          <Globe size={18} />
          Contact Information
        </CategoryTitle>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Mail size={14} />
              Support Email
            </SettingLabel>
          </SettingInfo>
          <InputField
            type="email"
            value={settings.contact.supportEmail}
            onChange={(e) => updateSetting('contact.supportEmail', e.target.value)}
            disabled={saving}
            placeholder="support@kolione.com"
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <Phone size={14} />
              Support Phone
            </SettingLabel>
          </SettingInfo>
          <InputField
            type="tel"
            value={settings.contact.supportPhone}
            onChange={(e) => updateSetting('contact.supportPhone', e.target.value)}
            disabled={saving}
            placeholder="+966 50 000 0000"
          />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>
              <MessageSquare size={14} />
              WhatsApp Number
            </SettingLabel>
          </SettingInfo>
          <InputField
            type="tel"
            value={settings.contact.whatsappNumber}
            onChange={(e) => updateSetting('contact.whatsappNumber', e.target.value)}
            disabled={saving}
            placeholder="+966500000000"
          />
        </SettingRow>
      </CategorySection>

      {/* ═══ Action Buttons ═══ */}
      <ActionButtons>
        <Button
          $variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Button
          $variant="secondary"
          onClick={loadSettings}
          disabled={saving}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>

        <Button
          $variant="danger"
          onClick={handleReset}
          disabled={saving}
        >
          <AlertCircle size={16} />
          Reset to Default
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default SiteSettingsControl;
